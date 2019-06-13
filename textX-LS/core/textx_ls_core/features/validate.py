from typing import List, Optional

from textx.exceptions import TextXError


def validate(metamodel, model_str) -> Optional[List[TextXError]]:
    """Validates given model. For now returned list will contain maximum one
    error, since textX does not have built-in error recovery mechanism.
    """
    errors = []
    try:
        try:
            metamodel.model_from_str(model_str)
        except AssertionError:  # https://github.com/textX/textX/blob/129fec9f334b7a101836eb2f23dbd650c7b8a4e6/textx/metamodel.py#L290
            pass
    except TextXError as e:
        errors.append(e)
    return errors
