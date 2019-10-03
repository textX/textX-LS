from typing import List, Optional

from textx.exceptions import TextXError


def validate(metamodel, model_str, file_name) -> Optional[List[TextXError]]:
    """Validates given model. For now returned list will contain maximum one
    error, since textX does not have built-in error recovery mechanism.
    """
    errors = []
    try:
        metamodel.model_from_str(model_str, file_name=file_name)
    except TextXError as e:
        errors.append(e)
    return errors
