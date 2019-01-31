import pytest
from textx_ls_core import utils


@pytest.mark.parametrize("uri, expected_ext", [
    (None, None),
    ('', ''),
    ('/test/path/file.txt', 'txt'),
    ('Textxfile', 'Textxfile')
])
def test_get_file_extension(uri, expected_ext):
    ext = utils.get_file_extension(uri)
    assert ext == expected_ext
