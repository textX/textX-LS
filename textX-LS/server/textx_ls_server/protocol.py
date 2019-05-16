from os.path import basename

from pygls.protocol import LanguageServerProtocol
from pygls.types import (DidChangeTextDocumentParams,
                         DidCloseTextDocumentParams, DidOpenTextDocumentParams,
                         MessageType)
from pygls.workspace import Document
from textx_ls_core.exceptions import (LanguageNotRegistered,
                                      MultipleLanguagesError)
from textx_ls_core.features.languages import get_language_metamodel


class TextXDocument(Document):
    """Represents document with additional information e.g. metamodel that can
    parse document's content."""

    def __init__(self, uri, language_name, metamodel, source=None,
                 version=None):
        super().__init__(uri, source, version, True)

        self.language_name = language_name
        self.metamodel = metamodel


class TextXProtocol(LanguageServerProtocol):
    """This class overrides text synchronization methods as we don't want to
    process languages that we don't support.
    """

    def bf_text_document__did_change(self,
                                     params: DidChangeTextDocumentParams):
        """Updates document's content if document is in the workspace."""
        if params.textDocument.uri in self.workspace.documents:
            for change in params.contentChanges:
                self.workspace.update_document(params.textDocument, change)

    def bf_text_document__did_close(self,
                                    params: DidCloseTextDocumentParams):
        """Removes document from workspace if it is added previously."""
        if params.textDocument.uri in self.workspace.documents:
            self.workspace.remove_document(params.textDocument.uri)

    def bf_text_document__did_open(self,
                                   params: DidOpenTextDocumentParams):
        """Puts document to the workspace for supported files."""
        doc = params.textDocument
        doc_uri = doc.uri
        doc_name = doc.languageId

        try:
            metamodel = get_language_metamodel(doc_name, basename(doc_uri))
            # Should not happen...
            if metamodel is None:
                self.show_message(
                    "Metamodel for language {} is not properly loaded!"
                    .format(MessageType.Error)
                )

            self.workspace._docs[doc_uri] = TextXDocument(doc_uri,
                                                          doc_name,
                                                          metamodel,
                                                          doc.text,
                                                          doc.version)
        except MultipleLanguagesError as e:
            self.show_message(str(e), MessageType.Warning)
        except LanguageNotRegistered:
            # Skip adding document to the workspace
            pass
