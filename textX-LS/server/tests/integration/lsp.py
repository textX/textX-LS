from pygls.features import (TEXT_DOCUMENT_DID_CHANGE, TEXT_DOCUMENT_DID_CLOSE,
                            TEXT_DOCUMENT_DID_OPEN)
from pygls.types import (DidChangeTextDocumentParams,
                         DidCloseTextDocumentParams, DidOpenTextDocumentParams)

from . import CALL_TIMEOUT


def send_text_doc_did_change_request(client, versioned_doc, content_changes):
    response = client.lsp.send_request(
        TEXT_DOCUMENT_DID_CHANGE,
        DidChangeTextDocumentParams(versioned_doc, content_changes)
    ).result(timeout=CALL_TIMEOUT)
    return response


def send_text_doc_did_close_request(client, doc_item):
    response = client.lsp.send_request(
        TEXT_DOCUMENT_DID_CLOSE, DidCloseTextDocumentParams(doc_item)
    ).result(timeout=CALL_TIMEOUT)
    return response


def send_text_doc_did_open_request(client, doc_item):
    response = client.lsp.send_request(
        TEXT_DOCUMENT_DID_OPEN, DidOpenTextDocumentParams(doc_item)
    ).result(timeout=CALL_TIMEOUT)
    return response
