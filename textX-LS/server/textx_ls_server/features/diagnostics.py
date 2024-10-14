from typing import List

from lsprotocol.types import Diagnostic, Position, Range

from textx.exceptions import TextXError
from textx_ls_core.features.validate import validate

from ..protocol import TextXDocument


def _create_diagnostics(doc: TextXDocument) -> List[Diagnostic]:
    """Creates diagnostics from TextXError objects.

    Args:
        doc: document to validate
    Returns:
        A list of diagnostics
    Raises:
        None

    """
    return [
        Diagnostic(_get_diagnostic_range(err), _get_diagnostic_message(err))
        for err in validate(doc.get_metamodel(True), doc.source, doc.path)
    ]


def _get_diagnostic_message(err: TextXError) -> str:
    """Prettifies error message.

    Args:
        err: an instance of TextXError (syntax or semantic)
    Returns:
        A string representation of an error
    Raises:
        None

    """
    msg = str(err)
    try:
        # Try to parse textX error message
        msg_decoded = err.args[0].decode("utf-8")
        msg = msg_decoded.split(" at")[0]
    except (AttributeError, LookupError):
        pass
    return msg


def _get_diagnostic_range(err: TextXError) -> Range:
    """Prettifies error message.

    Args:
        err: an instance of TextXError (syntax or semantic)
    Returns:
        A range which should be highlighted
    Raises:
        None

    """
    # Mark a whole line ( 500 for now, should be len(doc.lines[line]) )
    line = 0 if (err.line or 0) - 1 < 0 else (err.line or 0) - 1
    return Range(Position(line, 0), Position(line, 500))


def send_diagnostics(ls, doc: TextXDocument) -> None:
    """Sends diagnostics to the client.

    Args:
        ls: textX language server
        doc: document to validate
    Returns:
        A range which should be highlighted
    Raises:
        None

    """
    ls.publish_diagnostics(doc.uri, _create_diagnostics(doc))
