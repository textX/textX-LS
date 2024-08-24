import functools
from typing import Callable


def skip_not_supported_langs(func: Callable) -> Callable:
    """Decorator which checks if document is in the workspace and call
    decorated function.

    Args:
        func: callable that is being decorated
    Returns:
        Decorated callable
    Raises:
        None

    """

    @functools.wraps(func)
    def decorator(ls, params, **kwargs):
        try:
            doc = ls.workspace.documents[params.text_document.uri]
            kwargs["doc"] = doc
            return func(ls, params, **kwargs)
        except KeyError:
            pass

    return decorator
