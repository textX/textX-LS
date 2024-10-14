import sys
from os import linesep
from traceback import format_exc
from typing import Any, List, Mapping, Optional, Tuple

from lsprotocol.types import (
    TEXT_DOCUMENT_DID_CHANGE,
    TEXT_DOCUMENT_DID_CLOSE,
    TEXT_DOCUMENT_DID_OPEN,
    DidChangeTextDocumentParams,
    DidCloseTextDocumentParams,
    DidOpenTextDocumentParams,
    MessageType,
)
from pygls.server import LanguageServer
from textx import GeneratorDesc

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
from textx_ls_core.models import TextXProject
from textx_ls_core.utils import compare_project_names

from .features.diagnostics import send_diagnostics
from .protocol import TextXDocument, TextXProtocol
from .utils import skip_not_supported_langs

from .config import PACKAGE_NAME, VERSION


class TextXLanguageServer(LanguageServer):
    """Represents a language server for languages based on textX grammar.

    This is the entry point for all communications with the client(s).
    It uses custom `TextXProtocol`.

    Attributes:
        python_path (str): a path to the python executable that is running the server

    """

    CMD_GENERATE_EXTENSION = "textx/generateExtension"
    CMD_GENERATE_SYNTAXES = "textx/generateSyntaxes"
    CMD_GENERATOR_LIST = "textx/getGenerators"
    CMD_PING = "textx/ping"
    CMD_PROJECT_INSTALL = "textx/installProject"
    CMD_PROJECT_LIST = "textx/getProjects"
    CMD_PROJECT_SCAFFOLD = "textx/scaffoldProject"
    CMD_PROJECT_UNINSTALL = "textx/uninstallProject"
    CMD_VALIDATE_DOCUMENTS = "textx/validateDocuments"

    def __init__(self):
        super().__init__(name=PACKAGE_NAME, version=VERSION, protocol_cls=TextXProtocol)
        self.python_path = sys.executable

    def show_errors(self, err_msg: str, detailed_err_msg: Optional[str] = None) -> None:
        """Helper method to display pop up error message and detailed log to the
        output channel.

        Args:
            err_msg: short error message that is displayed in pop-up
            detailed_err_msg: detailed error message that is displayed in the output
                              channel
        Returns:
            True if extension is successfully generated, otherwise False
        Raises:
            None

        """
        self.show_message(err_msg, MessageType.Error)
        self.show_message_log(
            "{} due to: {}{}{}".format(
                err_msg, linesep, detailed_err_msg or format_exc(), linesep
            )
        )


textx_server = TextXLanguageServer()


@textx_server.command(TextXLanguageServer.CMD_GENERATE_EXTENSION)
def cmd_generate_extension(ls: TextXLanguageServer, params) -> bool:
    """Command that generates the extension.

    Args:
        params: a list that has `target`, `destination directory` and `command args`
    Returns:
        True if extension is successfully generated, otherwise False
    Raises:
        None

    """
    target, dest_dir, cmd_args = params

    try:
        generate_extension(target, dest_dir, **cmd_args)
        return True
    except GenerateExtensionError as e:
        ls.show_errors(str(e))
        return False


@textx_server.command(TextXLanguageServer.CMD_GENERATE_SYNTAXES)
def cmd_generate_syntaxes(ls: TextXLanguageServer, params) -> Mapping[str, Any]:
    """Command that generates syntax highlighting for all project languages.

    Args:
        params: a list that has `project name`, `target` and `command args`
    Returns:
        A map where keys are language names and values are syntax specifications
    Raises:
        None

    """
    project_name, target, cmd_args = params
    try:
        return generate_syntaxes(project_name, target, **cmd_args)
    except GenerateSyntaxHighlightError as e:
        ls.show_errors(str(e))
        return {}


@textx_server.command(TextXLanguageServer.CMD_GENERATOR_LIST)
def cmd_generator_list(ls: TextXLanguageServer, params) -> List[GeneratorDesc]:
    """Command that returns all registered generators.

    Args:
        params: empty
    Returns:
        A list of generators
    Raises:
        None

    """
    return get_generators()


@textx_server.command(TextXLanguageServer.CMD_PROJECT_INSTALL)
async def cmd_project_install(ls: TextXLanguageServer, params) -> Tuple[str, str, str]:
    """Command that installs a textX language project.

    Args:
        params: path to the python project directory (containing `setup.py`) or
                path to the wheel and flag that indicates if project should be
                install in editable (development) mode
    Returns:
        Project name, version and package dist location or Nones
    Raises:
        None

    """
    folder_or_wheel, editable = params

    ls.show_message("Installing project from {}".format(folder_or_wheel))

    try:
        project_name, project_version, dist_location = await install_project_async(
            folder_or_wheel, ls.python_path, editable, ls.show_message_log
        )
        ls.show_message("Project {} is successfully installed.".format(project_name))
        return project_name, project_version, dist_location
    except InstallTextXProjectError as e:
        ls.show_errors(str(e), e.detailed_err_msg)
        return None, None, None


@textx_server.command(TextXLanguageServer.CMD_PROJECT_LIST)
def cmd_project_list(ls: TextXLanguageServer, params) -> List[TextXProject]:
    """Command that returns all registered textX projects.

    Args:
        params: an indicator if languages should be added to the project DTO
    Returns:
        A list of textX projects
    Raises:
        None

    """
    load_langs = params[0] if len(params) == 1 else True
    return get_projects(load_langs)


@textx_server.command(TextXLanguageServer.CMD_PROJECT_SCAFFOLD)
def cmd_project_scaffold(ls: TextXLanguageServer, params) -> None:
    ls.show_message("Not implemented")


@textx_server.command(TextXLanguageServer.CMD_PROJECT_UNINSTALL)
async def cmd_project_uninstall(ls: TextXLanguageServer, params) -> bool:
    """Command that uninstalls a textX language project.

    Args:
        params: project name
    Returns:
        True if textX project is uninstalled successfully, otherwise False
    Raises:
        None

    """
    project_name = params[0]

    ls.show_message("Uninstalling project {}".format(project_name))

    try:
        await uninstall_project_async(project_name, ls.python_path, ls.show_message_log)
        ls.show_message("Project {} is successfully uninstalled.".format(project_name))
        return True
    except UninstallTextXProjectError as e:
        ls.show_errors(str(e), e.detailed_err_msg)
        return False


@textx_server.command(TextXLanguageServer.CMD_VALIDATE_DOCUMENTS)
def cmd_validate_documents(ls: TextXLanguageServer, params) -> None:
    """Command that re-validates all documents in the workspace that matches project.

    Args:
        params: project name
    Returns:
        None
    Raises:
        None

    """
    project_name = params[0]
    for doc in ls.workspace.documents.values():
        if project_name and compare_project_names(project_name, doc.project_name):
            if doc.is_refreshable:
                send_diagnostics(ls, doc)
            else:
                ls.show_message(
                    "Metamodel for language '{}' is cached and it couldn't be reloaded!".format(
                        doc.language_id
                    ),
                    MessageType.Warning,
                )


@textx_server.feature(TEXT_DOCUMENT_DID_CHANGE)
@skip_not_supported_langs
def doc_change(
    ls: TextXLanguageServer, params: DidChangeTextDocumentParams, doc: TextXDocument
) -> None:
    """Validates model on document text change.

    Args:
        params: Read LSP
        doc: document that will be validated
    Returns:
        None
    Raises:
        None

    """
    send_diagnostics(ls, doc)


@textx_server.feature(TEXT_DOCUMENT_DID_CLOSE)
def doc_close(ls: TextXLanguageServer, params: DidCloseTextDocumentParams) -> None:
    """Clear diagnostics when document is closed.

    Args:
        params: Read LSP
    Returns:
        None
    Raises:
        None

    """
    ls.publish_diagnostics(params.text_document.uri, [])


@textx_server.feature(TEXT_DOCUMENT_DID_OPEN)
@skip_not_supported_langs
def doc_open(
    ls: TextXLanguageServer, params: DidOpenTextDocumentParams, doc: TextXDocument
) -> None:
    """Validates model when document is open.

    Args:
        params: Read LSP
        doc: document that will be validated
    Returns:
        None
    Raises:
        None

    """
    send_diagnostics(ls, doc)


@textx_server.command(TextXLanguageServer.CMD_PING)
def _cmd_ping(ls: TextXLanguageServer, params) -> None:
    """Prevent server going into IDLE state on windows (?)."""
    pass
