import mock
import pytest
from pygls.types import DidOpenTextDocumentParams, TextDocumentItem

from textx_ls_server import utils

GET_FILE_EXTENSION_TARGET = 'textx_ls_server.utils.get_file_extension'


@pytest.fixture(scope='module')
def lang_extensions():
    return ('tx', 'textxfile')


@pytest.fixture(scope='module')
def languages():
    class FakeTemplate:
        def __init__(self, name):
            self.name = name

    return {
        'tx': FakeTemplate('textx'),
        'textxfile': FakeTemplate('textxfile')
    }


@pytest.fixture(scope='module')
def params():
    return DidOpenTextDocumentParams(TextDocumentItem('textxfile', '', 1, ''))


def test_call_with_lang_template(languages, params):
    to_wrap = mock.Mock(return_value=1)
    wrapped = utils.call_with_lang_template(to_wrap, languages)
    ret_val = wrapped(None, params)

    assert ret_val == 1
    # TODO: Check if it's called with 'lang_temp' in kwargs


@pytest.mark.parametrize("uri, expected", [
    ('/users/test/testfile.rst', False),
    ('/users/test/textxfile', True),
    ('/users/test/grammar.tx', True)
])
def test_is_ext_supported(lang_extensions, uri, expected):
    assert utils.is_ext_supported(uri, lang_extensions) is expected
