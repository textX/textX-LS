from pygls.types import Diagnostic, Position, Range

from textx_ls_core.features.validate import validate


def _create_diagnostics(doc):
    """Creates diagnostics from TextXError objects."""
    return [
        Diagnostic(_get_diagnostic_range(err), _get_diagnostic_message(err))
        for err in validate(doc.metamodel, doc.source, doc.path)
    ]


def _get_diagnostic_message(err):
    """Prettifies error message"""
    msg = str(err)
    try:
        # Try to parse textX error message
        msg_decoded = err.args[0].decode("utf-8")
        msg = msg_decoded.split(' at')[0]
    except (AttributeError, LookupError):
        pass
    return msg


def _get_diagnostic_range(err):
    # Mark a whole line ( 500 for now, should be len(doc.lines[line]) )
    line = 0 if err.line - 1 < 0 else err.line - 1
    return Range(Position(line, 0), Position(line, 500))


def send_diagnostics(ls, doc):
    """Sends diagnostics to the client."""
    ls.publish_diagnostics(doc.uri, _create_diagnostics(doc))
