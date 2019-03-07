from pygls.features import TEXT_DOCUMENT_DID_CHANGE, TEXT_DOCUMENT_DID_OPEN
from pygls.protocol import LanguageServerProtocol
from pygls.server import LanguageServer
from pygls.types import (DidChangeTextDocumentParams,
                         DidCloseTextDocumentParams, DidOpenTextDocumentParams)
from pygls.workspace import Document
from textx_ls_core.features.scaffolding import scaffold_language
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
    # Command constants
    CMD_LANGUAGE_SCAFFOLDING = "textX/languageScaffold"

    def __init__(self):
        super().__init__(protocol_cls=TextXProtocol)


textx_server = TextXLanguageServer()


@textx_server.command(TextXLanguageServer.CMD_LANGUAGE_SCAFFOLDING)
def cmd_language_scaffolding(ls: TextXLanguageServer, params):
    try:
        lang_name = params[0]
        cwd = params[1]

        scaffold_language(lang_name, cwd)
    except IndexError:
        ls.show_message("Language scaffolding command requires name.")


@textx_server.feature(TEXT_DOCUMENT_DID_CHANGE)
@skip_not_supported_langs
@call_with_lang_template
def doc_change(ls: TextXLanguageServer, params: DidChangeTextDocumentParams,
               doc: Document, lang_temp: LanguageTemplate):
    """Validates model on document text change."""
    send_diagnostics(ls, lang_temp, doc)


@textx_server.feature(TEXT_DOCUMENT_DID_OPEN)
@skip_not_supported_langs
@call_with_lang_template
def doc_open(ls: TextXLanguageServer, params: DidOpenTextDocumentParams,
             doc: Document, lang_temp: LanguageTemplate):
    """Validates model on document text change."""
    send_diagnostics(ls, lang_temp, doc)
