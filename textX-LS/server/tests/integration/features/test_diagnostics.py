from pygls.types import (Position, Range, TextDocumentContentChangeEvent,
                         VersionedTextDocumentIdentifier)

from .. import CALL_TIMEOUT
from ..conftest import builtin_notifications
from ..lsp import (send_text_doc_did_change_request,
                   send_text_doc_did_open_request)
from ..test_workspace import (TEXTXFILE_PATH, TEXTXFILE_WITH_ERROR_PATH,
                              doc_from_path)


def test_valid_textxfile_diagnostics_on_doc_open(client_server):
    client, server = client_server

    doc = doc_from_path(TEXTXFILE_PATH, 'textxfile')
    send_text_doc_did_open_request(client, doc)

    params = builtin_notifications.get(timeout=CALL_TIMEOUT)

    assert params.uri == doc.uri
    assert params.diagnostics == []

    # Remove all docs from the workspace
    server.workspace._docs = {}


def test_invalid_textxfile_diagnostic_on_doc_open(client_server):
    client, server = client_server

    doc = doc_from_path(TEXTXFILE_WITH_ERROR_PATH, 'textxfile')
    send_text_doc_did_open_request(client, doc)

    params = builtin_notifications.get(timeout=CALL_TIMEOUT)

    assert params.uri == doc.uri

    d = params.diagnostics[0]
    r = d.range
    assert d.message == "Expected ',' or ']'"
    assert r.start.line == 0
    assert r.start.character == 0
    assert r.end.line == 0
    assert r.end.character == 500

    # Remove all docs from the workspace
    server.workspace._docs = {}


def test_valid_textxfile_diagnostics_on_doc_change(client_server):
    client, server = client_server

    doc = doc_from_path(TEXTXFILE_PATH, 'textxfile')
    content = doc.text
    doc.text = ''
    # Add doc to server's workspace directly
    server.workspace.put_document(doc)

    versioned_doc = VersionedTextDocumentIdentifier(doc.uri, doc.version + 1)
    content_change = TextDocumentContentChangeEvent(
        Range(Position(0, 0), Position(0, 0)), 0, content
    )
    send_text_doc_did_change_request(client, versioned_doc, [content_change])

    params = builtin_notifications.get(timeout=CALL_TIMEOUT)

    assert params.uri == doc.uri
    assert params.diagnostics == []

    # Remove all docs from the workspace
    server.workspace._docs = {}


def test_invalid_textxfile_diagnostics_on_doc_change(client_server):
    client, server = client_server

    doc = doc_from_path(TEXTXFILE_WITH_ERROR_PATH, 'textxfile')
    content = doc.text
    doc.text = ''
    # Add doc to server's workspace directly
    server.workspace.put_document(doc)

    versioned_doc = VersionedTextDocumentIdentifier(doc.uri, doc.version + 1)
    content_change = TextDocumentContentChangeEvent(
        Range(Position(0, 0), Position(0, 0)), 0, content
    )
    send_text_doc_did_change_request(client, versioned_doc, [content_change])

    params = builtin_notifications.get(timeout=CALL_TIMEOUT)

    assert params.uri == doc.uri

    d = params.diagnostics[0]
    r = d.range
    assert d.message == "Expected ',' or ']'"
    assert r.start.line == 0
    assert r.start.character == 0
    assert r.end.line == 0
    assert r.end.character == 500

    # Remove all docs from the workspace
    server.workspace._docs = {}
