import sys

from pygls.features import (TEXT_DOCUMENT_DID_CHANGE, TEXT_DOCUMENT_DID_CLOSE,
                            TEXT_DOCUMENT_DID_OPEN)
from pygls.protocol import LanguageServerProtocol
from pygls.server import LanguageServer
from pygls.types import (
    DidChangeTextDocumentParams, DidCloseTextDocumentParams,
    DidOpenTextDocumentParams, MessageType)
from textx_ls_core.features.generators import (generate_extension,
                                               get_generators)
from textx_ls_core.features.languages import (get_languages,
                                              install_project_async,
                                              uninstall_project_async)

from .features.diagnostics import send_diagnostics
from .protocol import TextXDocument, TextXProtocol
from .utils import skip_not_supported_langs


class TextXLanguageServer(LanguageServer):
    CMD_GENERATE_EXTENSION = "textx/generateExtension"
    CMD_GENERATOR_LIST = "textx/getGenerators"
    CMD_LANGUAGE_LIST = "textx/getLanguages"
    CMD_PROJECT_INSTALL = "textx/installProject"
    CMD_PROJECT_SCAFFOLD = "textx/scaffoldProject"
    CMD_PROJECT_UNINSTALL = "textx/uninstallProject"

    def __init__(self):
        super().__init__(protocol_cls=TextXProtocol)

        self.python_path = sys.executable


textx_server = TextXLanguageServer()


@textx_server.command(TextXLanguageServer.CMD_GENERATE_EXTENSION)
def cmd_generate_extension(ls: TextXLanguageServer, params):
    project_name = params[0]
    target = params[1]
    dest_dir = params[2]
    return generate_extension(project_name, target, dest_dir)


@textx_server.command(TextXLanguageServer.CMD_GENERATOR_LIST)
@textx_server.thread()
def cmd_generator_list(ls: TextXLanguageServer, params):
    return get_generators()


@textx_server.command(TextXLanguageServer.CMD_PROJECT_INSTALL)
async def cmd_language_install(ls: TextXLanguageServer, params):
    folder_or_wheel = params[0]
    editable = params[1]

    ls.show_message("Installing language from {}".format(folder_or_wheel))
    is_installed, project_name = await install_project_async(folder_or_wheel,
                                                             ls.python_path,
                                                             editable,
                                                             msg_handler=ls.show_message_log)

    if is_installed:
        ls.show_message("Project {} is successfully installed."
                        .format(project_name))
    else:
        ls.show_message("Failed to install project {}."
                        .format(project_name), MessageType.Error)

    return project_name if is_installed else None


@textx_server.command(TextXLanguageServer.CMD_LANGUAGE_LIST)
@textx_server.thread()
def cmd_language_list(ls: TextXLanguageServer, params):
    return get_languages()


@textx_server.command(TextXLanguageServer.CMD_PROJECT_SCAFFOLD)
def cmd_language_scaffold(ls: TextXLanguageServer, params):
    pass


@textx_server.command(TextXLanguageServer.CMD_PROJECT_UNINSTALL)
async def cmd_language_uninstall(ls: TextXLanguageServer, params):
    project_name = params[0]

    ls.show_message("Uninstalling language project {}".format(project_name))
    is_uninstalled, lang_name = await uninstall_project_async(project_name,
                                                              ls.python_path,
                                                              ls.show_message_log)

    if is_uninstalled:
        ls.show_message("Uninstalled language project: {}"
                        .format(project_name))
    else:
        ls.show_message("Failed to uninstall language project {}"
                        .format(project_name), MessageType.Error)

    return lang_name


@textx_server.feature(TEXT_DOCUMENT_DID_CHANGE)
@skip_not_supported_langs
def doc_change(ls: TextXLanguageServer, params: DidChangeTextDocumentParams,
               doc: TextXDocument):
    """Validates model on document text change."""
    send_diagnostics(ls, doc)


@textx_server.feature(TEXT_DOCUMENT_DID_CLOSE)
def doc_close(ls: TextXLanguageServer, params: DidCloseTextDocumentParams):
    """Clear diagnostics on document close event."""

    ls.publish_diagnostics(params.textDocument.uri, [])


@textx_server.feature(TEXT_DOCUMENT_DID_OPEN)
@skip_not_supported_langs
def doc_open(ls: TextXLanguageServer, params: DidOpenTextDocumentParams,
             doc: TextXDocument):
    """Validates model on document text change."""
    send_diagnostics(ls, doc)
