import asyncio
import os
import queue
from threading import Thread

import pytest
from pygls.features import EXIT, SHUTDOWN, TEXT_DOCUMENT_PUBLISH_DIAGNOSTICS
from pygls.server import LanguageServer
from pygls.types import (ClientCapabilities, Diagnostic, InitializeParams,
                         PublishDiagnosticsParams)
from pygls.uris import from_fs_path

from textx_ls_server.server import textx_server

from . import CALL_TIMEOUT
from .test_workspace import WORKSPACE_PATH

builtin_notifications = queue.Queue()


@pytest.fixture(scope='session', autouse=True)
def client_server():
    """ A fixture to setup a client/server """

    # Client to Server pipe
    csr, csw = os.pipe()
    # Server to client pipe
    scr, scw = os.pipe()

    # Run server
    server_thread = Thread(target=textx_server.start_io, args=(
        os.fdopen(csr, 'rb'), os.fdopen(scw, 'wb')
    ))
    server_thread.daemon = True
    server_thread.start()

    # Setup client
    client = LanguageServer(asyncio.new_event_loop())
    client_thread = Thread(target=client.start_io, args=(
        os.fdopen(scr, 'rb'), os.fdopen(csw, 'wb')
    ))
    client_thread.daemon = True
    client_thread.start()

    # Register client features to catch responses
    register_client_features(client)

    # Initialize server
    initialize_server(textx_server)

    yield client, textx_server

    shutdown_response = client.lsp.send_request(
        SHUTDOWN).result(timeout=CALL_TIMEOUT)

    assert shutdown_response is None
    client.send_notification(EXIT)


def initialize_server(server):
    server.lsp.bf_initialize(
        InitializeParams(process_id=1234,
                         capabilities=ClientCapabilities(),
                         root_uri=from_fs_path(WORKSPACE_PATH)))


def register_client_features(client):

    # Register publish diagnostics notification handler
    @client.feature(TEXT_DOCUMENT_PUBLISH_DIAGNOSTICS)
    def publish_diagnostics(ls, params):  # pylint: disable=unused-variable
        builtin_notifications.put(PublishDiagnosticsParams(params.uri, [
            Diagnostic(d.range, d.message) for d in params.diagnostics
        ]))
