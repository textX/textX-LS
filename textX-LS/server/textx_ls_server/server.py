from pygls.features import COMPLETION
from pygls.server import LanguageServer
from pygls.types import CompletionItem, CompletionList, CompletionParams
from textx_ls_core.features.completions import get_completions


class TextXLanguageServer(LanguageServer):
    def __init__(self):
        super().__init__()


textx_server = TextXLanguageServer()


@textx_server.feature(COMPLETION)
def completions(params: CompletionParams = None):
    """Returns completion items."""
    return CompletionList(False, [
        CompletionItem(label) for label in get_completions()
    ])
