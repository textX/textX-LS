import functools


def skip_not_supported_langs(func):
    """Decorator which checks if document is in the workspace and call
    decorated function.
    """

    @functools.wraps(func)
    def decorator(ls, params, **kwargs):
        try:
            doc = ls.workspace.documents[params.textDocument.uri]
            kwargs["doc"] = doc
            return func(ls, params, **kwargs)
        except KeyError:
            pass

    return decorator
