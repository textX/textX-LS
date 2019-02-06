from os.path import dirname, exists, join

from pygls.types import TextDocumentItem

WORKSPACE_PATH = dirname(__file__)

TEXTXFILE_PATH = join(WORKSPACE_PATH, 'Textxfile')
TEXTXFILE_WITH_ERROR_PATH = join(WORKSPACE_PATH, 'bad.textxfile')


def doc_from_path(path, lang_id):
    if exists(path):
        with open(path, 'r') as f:
            return TextDocumentItem(path, lang_id, 1, f.read())
    return None
