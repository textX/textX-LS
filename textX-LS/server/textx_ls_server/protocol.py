from os.path import basename
from typing import Optional, Union

from pygls.protocol import LanguageServerProtocol
from pygls.types import (
    DidChangeTextDocumentParams,
    DidCloseTextDocumentParams,
    DidOpenTextDocumentParams,
    MessageType,
)
from pygls.uris import to_fs_path
from pygls.workspace import Document

from textx.metamodel import TextXMetaMetaModel, TextXMetaModel
from textx_ls_core.exceptions import LanguageNotRegistered, MultipleLanguagesError
from textx_ls_core.features.projects import get_language_desc


class TextXDocument(Document):
    """Represents document with additional information e.g. metamodel that can
    parse document's content.

    Attributes:
        project_name (str): project name
        language_name (bool): language name
        mm_loader (Callable|TextXMetaMetaModel|TextXMetaModel): a language metamodel
        _metamodel (TextXMetaModel): cached language metamodel

    NOTE: If `mm_loader` returns a cached metamodel for a language (not callable) and
          if language is installed in *editable* mode, editor won't be refreshed on
          grammar changes!

    """

    def __init__(
        self,
        uri,
        project_root,
        language_name,
        project_name,
        mm_loader,
        source=None,
        version=None,
    ):
        super().__init__(uri, source, version, True)

        self.project_root = to_fs_path(project_root)
        self.project_name = project_name
        self.language_name = language_name
        self.mm_loader = mm_loader

        self._metamodel = None
        self.refresh_metamodel()

    @property
    def is_refreshable(self) -> bool:
        """Indicates if language metamodel can be refreshed.

        Args:
            None
        Returns:
            Returns True if metamodel is refreshable, otherwise False
        Raises:
            None

        """
        try:
            return id(self._metamodel) != id(self.mm_loader())
        except TypeError:
            return False

    def get_metamodel(
        self, refresh: Optional[bool] = False
    ) -> Union[TextXMetaMetaModel, TextXMetaModel]:
        """Returns a language metamodel.

        Args:
            refresh: If True, language metamodel will be re-loaded before returning
        Returns:
            Decorated callable
        Raises:
            None

        """
        if self._metamodel is None or refresh:
            self.refresh_metamodel()
        return self._metamodel

    def refresh_metamodel(self) -> None:
        """Refreshes (reloads) a language metamodel.

        Args:
            None
        Returns:
            None
        Raises:
            None

        """
        self._metamodel = (
            self.mm_loader() if callable(self.mm_loader) else self.mm_loader
        )


class TextXProtocol(LanguageServerProtocol):
    """Represents a slightly modified Language Server Protocol. It is used to process
    only textX languages.

    Overridden methods:
        bf_text_document__did_change
        bf_text_document__did_close
        bf_text_document__did_open

    """

    def bf_text_document__did_change(self, params: DidChangeTextDocumentParams) -> None:
        """Updates document's content if document is in the workspace.

        Args:
            params: Read LSP
        Returns:
            None
        Raises:
            None

        """
        if params.textDocument.uri in self.workspace.documents:
            for change in params.contentChanges:
                self.workspace.update_document(params.textDocument, change)

    def bf_text_document__did_close(self, params: DidCloseTextDocumentParams) -> None:
        """Removes document from workspace if it is added previously.

        Args:
            params: Read LSP
        Returns:
            None
        Raises:
            None

        """
        if params.textDocument.uri in self.workspace.documents:
            self.workspace.remove_document(params.textDocument.uri)

    def bf_text_document__did_open(self, params: DidOpenTextDocumentParams) -> None:
        """Puts document to the workspace for supported files.

        Args:
            params: Read LSP
        Returns:
            None
        Raises:
            None

        """
        doc = params.textDocument
        doc_uri, lang_id = doc.uri, doc.languageId

        try:
            lang_desc = get_language_desc(lang_id, basename(doc_uri))
            mm_loader = lang_desc.metamodel
            # Should not happen...
            if mm_loader is None:
                self.show_message(
                    "Metamodel for language {} is not properly loaded!".format(
                        MessageType.Error
                    )
                )
                return

            self.workspace._docs[doc_uri] = TextXDocument(
                doc_uri,
                self._get_project_root(doc_uri),
                lang_id,
                lang_desc.project_name,
                mm_loader,
                doc.text,
                doc.version,
            )
        except MultipleLanguagesError as e:
            self.show_message(str(e), MessageType.Warning)
        except LanguageNotRegistered:
            # Skip adding document to the workspace
            pass

    def _get_project_root(self, doc_uri):
        for folder_uri in sorted(self.workspace.folders.keys(), key=len, reverse=True):
            if folder_uri in doc_uri:
                return folder_uri
        return self.workspace.root_path
