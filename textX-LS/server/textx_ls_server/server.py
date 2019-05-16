import sys

from pygls.features import (TEXT_DOCUMENT_DID_CHANGE, TEXT_DOCUMENT_DID_CLOSE,
                            TEXT_DOCUMENT_DID_OPEN)
from pygls.protocol import LanguageServerProtocol
from pygls.server import LanguageServer
from pygls.types import (DidChangeTextDocumentParams,
                         DidCloseTextDocumentParams, DidOpenTextDocumentParams)
from textx_ls_core.features.generators import get_generators
from textx_ls_core.features.languages import (get_languages,
                                              install_language_async)

from .features.diagnostics import send_diagnostics
from .protocol import TextXDocument, TextXProtocol
from .utils import skip_not_supported_langs


class TextXLanguageServer(LanguageServer):
    CMD_GENERATOR_LIST = "textx/getGenerators"
    CMD_LANGUAGE_LIST = "textx/getLanguages"
    CMD_LANGUAGE_INSTALL = "textx/installLanguage"
    CMD_LANGUAGE_SCAFFOLD = "textx/scaffoldLanguage"
    CMD_LANGUAGE_UNINSTALL = "textx/uninstallLanguage"

    def __init__(self):
        super().__init__(protocol_cls=TextXProtocol)

        self.python_path = sys.executable


textx_server = TextXLanguageServer()


@textx_server.command(TextXLanguageServer.CMD_GENERATOR_LIST)
@textx_server.thread()
def cmd_generator_list(ls: TextXLanguageServer, params):
    return get_generators()


@textx_server.command(TextXLanguageServer.CMD_LANGUAGE_INSTALL)
async def cmd_language_install(ls: TextXLanguageServer, params):
    setuppy_or_wheel = params[0]
    await install_language_async(setuppy_or_wheel, ls.python_path,
                                 lambda msg: ls.show_message_log(msg))


@textx_server.command(TextXLanguageServer.CMD_LANGUAGE_LIST)
@textx_server.thread()
def cmd_language_list(ls: TextXLanguageServer, params):
    return get_languages()


@textx_server.command(TextXLanguageServer.CMD_LANGUAGE_SCAFFOLD)
def cmd_language_scaffold(ls: TextXLanguageServer, params):
    pass


@textx_server.command(TextXLanguageServer.CMD_LANGUAGE_UNINSTALL)
def cmd_language_uninstall(ls: TextXLanguageServer, params):
    pass


@textx_server.feature(TEXT_DOCUMENT_DID_CHANGE)
@skip_not_supported_langs
def doc_change(ls: TextXLanguageServer, params: DidChangeTextDocumentParams,
               doc: TextXDocument):
    """Validates model on document text change."""
    send_diagnostics(ls, doc)


@textx_server.feature(TEXT_DOCUMENT_DID_CLOSE)
def doc_close(ls: TextXLanguageServer, params: DidCloseTextDocumentParams):
    """Clear diagnostics on document close event."""

    ls.publish_diagnostics(params.textDocument.uri, [])


@textx_server.feature(TEXT_DOCUMENT_DID_OPEN)
@skip_not_supported_langs
def doc_open(ls: TextXLanguageServer, params: DidOpenTextDocumentParams,
             doc: TextXDocument):
    """Validates model on document text change."""
    send_diagnostics(ls, doc)
