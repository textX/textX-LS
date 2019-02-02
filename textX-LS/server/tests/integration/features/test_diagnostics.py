from .. import CALL_TIMEOUT
from ..conftest import builtin_notifications
from ..lsp import send_text_doc_did_open_request
from ..test_workspace import (TEXTXFILE_PATH, TEXTXFILE_WITH_ERROR_PATH,
                              doc_from_path)


def test_valid_textxfile_diagnostics_on_doc_open(client_server):
    client, server = client_server

    doc = doc_from_path(TEXTXFILE_PATH)
    send_text_doc_did_open_request(client, doc.uri, 'textxfile', doc.source)

    params = builtin_notifications.get(timeout=CALL_TIMEOUT)

    assert params.uri == doc.uri
    assert params.diagnostics == []


def test_invalid_textxfile_diiagnostic_on_doc_open(client_server):
    client, server = client_server

    doc = doc_from_path(TEXTXFILE_WITH_ERROR_PATH)
    send_text_doc_did_open_request(client, doc.uri, 'textxfile', doc.source)

    params = builtin_notifications.get(timeout=CALL_TIMEOUT)

    assert params.uri == doc.uri

    d = params.diagnostics[0]
    r = d.range
    assert d.message == "Expected ',' or ']'"
    assert r.start.line == 0
    assert r.start.character == 0
    assert r.end.line == 0
    assert r.end.character == 500
