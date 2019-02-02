from pygls.features import TEXT_DOCUMENT_DID_CHANGE, TEXT_DOCUMENT_DID_OPEN
from pygls.types import (DidChangeTextDocumentParams,
                         DidOpenTextDocumentParams,
                         TextDocumentContentChangeEvent, TextDocumentItem,
                         VersionedTextDocumentIdentifier)

from . import CALL_TIMEOUT


def send_text_doc_did_change_request(client, uri, text):
    response = client.lsp.send_request(
        TEXT_DOCUMENT_DID_CHANGE,
        DidChangeTextDocumentParams(
            VersionedTextDocumentIdentifier(uri, 2),
            [TextDocumentContentChangeEvent(None, None, text)]
        )
    ).result(timeout=CALL_TIMEOUT)
    return response


def send_text_doc_did_open_request(client, uri, lang_id, text):
    response = client.lsp.send_request(
        TEXT_DOCUMENT_DID_OPEN,
        DidOpenTextDocumentParams(TextDocumentItem(uri, lang_id, 1, text))
    ).result(timeout=CALL_TIMEOUT)
    return response
