import sys

from pygls.features import (TEXT_DOCUMENT_DID_CHANGE, TEXT_DOCUMENT_DID_CLOSE,
                            TEXT_DOCUMENT_DID_OPEN)
from pygls.protocol import LanguageServerProtocol
from pygls.server import LanguageServer
from pygls.types import (DidChangeTextDocumentParams,
                         DidCloseTextDocumentParams, DidOpenTextDocumentParams)
from pygls.workspace import Document
from textx_ls_core.exceptions import (LanguageInstallError,
                                      LanguageScaffoldError,
                                      LanguageUninstallError)
from textx_ls_core.features.lang_manager import (install_language,
                                                 scaffold_language,
                                                 uninstall_language)
from textx_ls_core.languages import LANG_MODULES, LANGUAGES, LanguageTemplate

from .features.diagnostics import send_diagnostics
from .utils import (call_with_lang_template, is_ext_supported,
                    skip_not_supported_langs)


class TextXProtocol(LanguageServerProtocol):
    """This class overrides text synchronization methods as we don't want to
    process languages that we don't support.
    """

    def bf_text_document__did_change(self,
                                     params: DidChangeTextDocumentParams):
        """Updates document's content if document is in the workspace."""
        if is_ext_supported(params.textDocument.uri, list(LANGUAGES.keys())):
            for change in params.contentChanges:
                self.workspace.update_document(params.textDocument, change)

    def bf_text_document__did_close(self,
                                    params: DidCloseTextDocumentParams):
        """Removes document from workspace."""
        if is_ext_supported(params.textDocument.uri, list(LANGUAGES.keys())):
            self.workspace.remove_document(params.textDocument.uri)

    def bf_text_document__did_open(self,
                                   params: DidOpenTextDocumentParams):
        """Puts document to the workspace for supported files."""
        if is_ext_supported(params.textDocument.uri, list(LANGUAGES.keys())):
            self.workspace.put_document(params.textDocument)


class TextXLanguageServer(LanguageServer):
    # Command constants
    CMD_LANGUAGE_INSTALL = "textX/languageInstall"
    CMD_LANGUAGE_LIST = "textX/languageList"
    CMD_LANGUAGE_SCAFFOLD = "textX/languageScaffold"
    CMD_LANGUAGE_UNINSTALL = "textX/languageUninstall"

    def __init__(self):
        super().__init__(protocol_cls=TextXProtocol)

        self.python_path = sys.executable


textx_server = TextXLanguageServer()


@textx_server.command(TextXLanguageServer.CMD_LANGUAGE_INSTALL)
def cmd_language_install(ls: TextXLanguageServer, params):
    try:
        lang_path = params[0]
        stdout = install_language(lang_path, ls.python_path, True)
        ls.show_message_log(stdout)
        ls.show_message("Language package installed.")
    except (IndexError, LanguageInstallError) as e:
        ls.show_message(str(e))


@textx_server.command(TextXLanguageServer.CMD_LANGUAGE_LIST)
def cmd_langauge_list(ls: TextXLanguageServer, params):
    return list(LANG_MODULES.values())


@textx_server.command(TextXLanguageServer.CMD_LANGUAGE_SCAFFOLD)
def cmd_language_scaffold(ls: TextXLanguageServer, params):
    try:
        lang_name = params[0]
        cwd = params[1]
        dest = scaffold_language(lang_name, cwd)
        ls.show_message("Language package scaffolded at {}".format(dest))
    except (IndexError, LanguageScaffoldError) as e:
        ls.show_message(str(e))


@textx_server.command(TextXLanguageServer.CMD_LANGUAGE_UNINSTALL)
def cmd_language_uninstall(ls: TextXLanguageServer, params):
    try:
        lang_name = params[0]
        stdout = uninstall_language(lang_name, ls.python_path, True)
        ls.show_message_log(stdout)
        ls.show_message("Language {} uninstalled.".format(lang_name))
    except (IndexError, LanguageUninstallError) as e:
        ls.show_message(str(e))


@textx_server.feature(TEXT_DOCUMENT_DID_CHANGE)
@skip_not_supported_langs
@call_with_lang_template
def doc_change(ls: TextXLanguageServer, params: DidChangeTextDocumentParams,
               doc: Document, lang_temp: LanguageTemplate):
    """Validates model on document text change event."""
    send_diagnostics(ls, lang_temp, doc)


@textx_server.feature(TEXT_DOCUMENT_DID_CLOSE)
def doc_close(ls: TextXLanguageServer, params: DidCloseTextDocumentParams):
    """Clear diagnostics on document close event."""
    ls.publish_diagnostics(params.textDocument.uri, [])


@textx_server.feature(TEXT_DOCUMENT_DID_OPEN)
@skip_not_supported_langs
@call_with_lang_template
def doc_open(ls: TextXLanguageServer, params: DidOpenTextDocumentParams,
             doc: Document, lang_temp: LanguageTemplate):
    """Validates model on document open event."""
    send_diagnostics(ls, lang_temp, doc)
