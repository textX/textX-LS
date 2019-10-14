import sys
from os import linesep
from traceback import format_exc

from pygls.features import (
    TEXT_DOCUMENT_DID_CHANGE,
    TEXT_DOCUMENT_DID_CLOSE,
    TEXT_DOCUMENT_DID_OPEN,
)
from pygls.server import LanguageServer
from pygls.types import (
    DidChangeTextDocumentParams,
    DidCloseTextDocumentParams,
    DidOpenTextDocumentParams,
    MessageType,
)

from textx_ls_core.exceptions import (
    GenerateExtensionError,
    GenerateSyntaxHighlightError,
    InstallTextXProjectError,
    UninstallTextXProjectError,
)
from textx_ls_core.features.generators import (
    generate_extension,
    generate_syntaxes,
    get_generators,
)
from textx_ls_core.features.projects import (
    get_projects,
    install_project_async,
    uninstall_project_async,
)
from textx_ls_core.utils import compare_project_names

from .features.diagnostics import send_diagnostics
from .protocol import TextXDocument, TextXProtocol
from .utils import skip_not_supported_langs


class TextXLanguageServer(LanguageServer):
    CMD_GENERATE_EXTENSION = "textx/generateExtension"
    CMD_GENERATE_SYNTAXES = "textx/generateSyntaxes"
    CMD_GENERATOR_LIST = "textx/getGenerators"
    CMD_PROJECT_INSTALL = "textx/installProject"
    CMD_PROJECT_LIST = "textx/getProjects"
    CMD_PROJECT_SCAFFOLD = "textx/scaffoldProject"
    CMD_PROJECT_UNINSTALL = "textx/uninstallProject"
    CMD_VALIDATE_DOCUMENTS = "textx/validateDocuments"

    def __init__(self):
        super().__init__(protocol_cls=TextXProtocol)
        self.python_path = sys.executable

    def show_errors(self, err_msg, detailed_err_msg=None):
        self.show_message(err_msg, MessageType.Error)
        self.show_message_log(
            "{} due to: {}{}{}".format(
                err_msg, linesep, detailed_err_msg or format_exc(), linesep
            )
        )


textx_server = TextXLanguageServer()


@textx_server.command(TextXLanguageServer.CMD_GENERATE_EXTENSION)
def cmd_generate_extension(ls: TextXLanguageServer, params):
    target, dest_dir, cmd_args = params

    try:
        generate_extension(target, dest_dir, **cmd_args._asdict())
        return True
    except GenerateExtensionError:
        err_msg = "Failed to generate the extension for '{}' with following arguments: '{}'.".format(
            target, cmd_args
        )
        ls.show_errors(err_msg)
        return False


@textx_server.command(TextXLanguageServer.CMD_GENERATE_SYNTAXES)
def cmd_generate_syntaxes(ls: TextXLanguageServer, params):
    project_name, target, cmd_args = params
    try:
        return generate_syntaxes(project_name, target, **cmd_args._asdict())
    except GenerateSyntaxHighlightError:
        err_msg = "Failed to generate syntax highlighting for '{}'.".format(
            project_name
        )
        ls.show_errors(err_msg)
        return {}


@textx_server.command(TextXLanguageServer.CMD_GENERATOR_LIST)
@textx_server.thread()
def cmd_generator_list(ls: TextXLanguageServer, params):
    return get_generators()


@textx_server.command(TextXLanguageServer.CMD_PROJECT_INSTALL)
async def cmd_project_install(ls: TextXLanguageServer, params):
    folder_or_wheel, editable = params

    ls.show_message("Installing project from {}".format(folder_or_wheel))

    try:
        project_name, dist_location = await install_project_async(
            folder_or_wheel, ls.python_path, editable, ls.show_message_log
        )
        ls.show_message("Project {} is successfully installed.".format(project_name))
        return project_name, dist_location
    except InstallTextXProjectError:
        err_msg = "Failed to install project from {}.".format(folder_or_wheel)
        ls.show_errors(err_msg)
        return None, None


@textx_server.command(TextXLanguageServer.CMD_PROJECT_LIST)
@textx_server.thread()
def cmd_project_list(ls: TextXLanguageServer, params):
    load_langs = params[0] if len(params) == 1 else True
    return get_projects(load_langs)


@textx_server.command(TextXLanguageServer.CMD_PROJECT_SCAFFOLD)
def cmd_project_scaffold(ls: TextXLanguageServer, params):
    ls.show_message("Not implemented")


@textx_server.command(TextXLanguageServer.CMD_PROJECT_UNINSTALL)
async def cmd_project_uninstall(ls: TextXLanguageServer, params):
    project_name = params[0]

    ls.show_message("Uninstalling project {}".format(project_name))

    try:
        await uninstall_project_async(project_name, ls.python_path, ls.show_message_log)
        ls.show_message("Project {} is successfully uninstalled.".format(project_name))
        return True
    except UninstallTextXProjectError:
        err_msg = "Failed to uninstall project {}.".format(project_name)
        ls.show_errors(err_msg)
        return False


@textx_server.command(TextXLanguageServer.CMD_VALIDATE_DOCUMENTS)
def cmd_validate_documents(ls: TextXLanguageServer, params):
    project_name = params[0]
    for doc in ls.workspace.documents.values():
        if project_name and compare_project_names(project_name, doc.project_name):
            send_diagnostics(ls, doc)


@textx_server.feature(TEXT_DOCUMENT_DID_CHANGE)
@skip_not_supported_langs
def doc_change(
    ls: TextXLanguageServer, params: DidChangeTextDocumentParams, doc: TextXDocument
):
    """Validates model on document text change."""
    send_diagnostics(ls, doc)


@textx_server.feature(TEXT_DOCUMENT_DID_CLOSE)
def doc_close(ls: TextXLanguageServer, params: DidCloseTextDocumentParams):
    """Clear diagnostics on document close event."""
    ls.publish_diagnostics(params.textDocument.uri, [])


@textx_server.feature(TEXT_DOCUMENT_DID_OPEN)
@skip_not_supported_langs
def doc_open(
    ls: TextXLanguageServer, params: DidOpenTextDocumentParams, doc: TextXDocument
):
    """Validates model on document text change."""
    send_diagnostics(ls, doc)
