from os.path import dirname, exists, join

from pygls.workspace import Document

WORKSPACE_PATH = dirname(__file__)

TEXTXFILE_PATH = join(WORKSPACE_PATH, 'Textxfile')
TEXTXFILE_WITH_ERROR_PATH = join(WORKSPACE_PATH, 'bad.textxfile')


def doc_from_path(path):
    if exists(path):
        with open(path, 'r') as f:
            return Document(path, f.read(), 1)
    return None
