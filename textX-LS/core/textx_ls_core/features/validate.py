from functools import partial
from typing import List, Optional

from textx.exceptions import TextXError
from textx.metamodel import TextXMetaMetaModel


def _pre_ref_resolution_callback(filename, model):
    if model:
        model._tx_filename = filename


def validate(metamodel, model_str, file_name) -> Optional[List[TextXError]]:
    """Validates given model. For now returned list will contain maximum one
    error, since textX does not have built-in error recovery mechanism.
    """
    errors = []
    try:
        try:
            if isinstance(metamodel, TextXMetaMetaModel):  # Parse .tx files
                # FIX: file_name=file_name else it raises AssertionError
                metamodel.model_from_str(model_str)
            else:  # Parse other models
                metamodel.model_from_str(
                    model_str,
                    pre_ref_resolution_callback=partial(_pre_ref_resolution_callback, file_name))
        except AssertionError:  # https://github.com/textX/textX/blob/129fec9f334b7a101836eb2f23dbd650c7b8a4e6/textx/metamodel.py#L290
            pass
    except TextXError as e:
        errors.append(e)
    return errors
