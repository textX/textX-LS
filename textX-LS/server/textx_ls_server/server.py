from pygls.features import (TEXT_DOCUMENT_DID_CHANGE, TEXT_DOCUMENT_DID_CLOSE,
                            TEXT_DOCUMENT_DID_OPEN)
from pygls.protocol import LanguageServerProtocol
from pygls.server import LanguageServer
from pygls.types import (DidChangeTextDocumentParams,
                         DidCloseTextDocumentParams, DidOpenTextDocumentParams)
from pygls.workspace import Document
from textx_ls_core.features.languages import get_generators, get_languages
from textx_ls_core.languages import LanguageTemplate

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
        if is_ext_supported(params.textDocument.uri):
            for change in params.contentChanges:
                self.workspace.update_document(params.textDocument, change)

    def bf_text_document__did_close(self,
                                    params: DidCloseTextDocumentParams):
        """Removes document from workspace."""
        if is_ext_supported(params.textDocument.uri):
            self.workspace.remove_document(params.textDocument.uri)

    def bf_text_document__did_open(self,
                                   params: DidOpenTextDocumentParams):
        """Puts document to the workspace for supported files."""
        if is_ext_supported(params.textDocument.uri):
            self.workspace.put_document(params.textDocument)


class TextXLanguageServer(LanguageServer):
    CMD_GENERATOR_LIST = "textx/getGenerators"
    CMD_LANGUAGE_LIST = "textx/getLanguages"
    CMD_LANGUAGE_INSTALL = "textx/installLanguage"
    CMD_LANGUAGE_SCAFFOLD = "textx/scaffoldLanguage"
    CMD_LANGUAGE_UNINSTALL = "textx/uninstallLanguage"

    def __init__(self):
        super().__init__(protocol_cls=TextXProtocol)


textx_server = TextXLanguageServer()


@textx_server.command(TextXLanguageServer.CMD_GENERATOR_LIST)
@textx_server.thread()
def cmd_get_generators(ls: TextXLanguageServer, params):
    return get_generators()


@textx_server.command(TextXLanguageServer.CMD_LANGUAGE_LIST)
@textx_server.thread()
def cmd_get_languages(ls: TextXLanguageServer, params):
    return get_languages()


@textx_server.command(TextXLanguageServer.CMD_LANGUAGE_INSTALL)
def cmd_install_language(ls: TextXLanguageServer, params):
    pass


@textx_server.command(TextXLanguageServer.CMD_LANGUAGE_SCAFFOLD)
def cmd_scaffold_language(ls: TextXLanguageServer, params):
    pass


@textx_server.command(TextXLanguageServer.CMD_LANGUAGE_UNINSTALL)
def cmd_uninstall_language(ls: TextXLanguageServer, params):
    pass


@textx_server.feature(TEXT_DOCUMENT_DID_CHANGE)
@skip_not_supported_langs
@call_with_lang_template
def doc_change(ls: TextXLanguageServer, params: DidChangeTextDocumentParams,
               doc: Document, lang_temp: LanguageTemplate):
    """Validates model on document text change."""
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
    """Validates model on document text change."""
    send_diagnostics(ls, lang_temp, doc)
