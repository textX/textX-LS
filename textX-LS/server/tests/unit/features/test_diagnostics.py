import mock
import pytest
from lsprotocol.types import Diagnostic, Position, Range

from textx.exceptions import TextXSyntaxError
from textx_ls_server.features import diagnostics as diag
from textx_ls_server.protocol import TextXDocument

VALIDATE_FUNC_TARGET = "textx_ls_server.features.diagnostics.validate"
SERVER_CREATE_DIAGNOSTICS_TARGET = (
    "textx_ls_server.features.diagnostics." "_create_diagnostics"
)


@pytest.fixture(scope="module")
def doc():
    return TextXDocument("uri", "../uri", "mydsl", "project", None, "source")


@pytest.fixture(scope="module")
def server():
    class FakeServer:
        """We don't need real server to unit test features."""

        pass

    server = FakeServer()
    server.publish_diagnostics = mock.Mock()
    return server


@pytest.mark.parametrize(
    "err, msg, st_line, st_col, end_line, end_col",
    [
        ([], None, None, None, None, None),
        ([TextXSyntaxError("test1", 0, 0)], "test1", 0, 0, 0, 500),
        ([TextXSyntaxError("test2", 5, 5)], "test2", 4, 0, 4, 500),
    ],
)
def test_create_diagnostics(doc, err, msg, st_line, st_col, end_line, end_col):
    with mock.patch(VALIDATE_FUNC_TARGET, return_value=err):
        diags = diag._create_diagnostics(doc)

        # Case when model is valid
        if err == []:
            assert diags == []
        else:
            assert diags[0].message == msg
            assert diags[0].range.start.line == st_line
            assert diags[0].range.start.character == st_col
            assert diags[0].range.end.line == end_line
            assert diags[0].range.end.character == end_col


def test_get_diagnostic_message():
    err = TextXSyntaxError("test", 2, 2)
    err.args = ()
    msg = diag._get_diagnostic_message(err)
    assert msg == str(err)


@pytest.mark.parametrize(
    "diags, ", [([]), ([Diagnostic(Range(Position(5, 5), Position(5, 5)), "test")])]
)
def test_send_diagnostics(server, doc, diags):
    with mock.patch(SERVER_CREATE_DIAGNOSTICS_TARGET, return_value=diags):
        diag.send_diagnostics(server, doc)
        server.publish_diagnostics.assert_called_with(doc.uri, diags)
