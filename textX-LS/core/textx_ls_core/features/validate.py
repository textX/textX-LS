from typing import List, Union

from textx.exceptions import TextXError
from textx.metamodel import TextXMetaMetaModel, TextXMetaModel


def validate(
    metamodel: Union[TextXMetaMetaModel, TextXMetaModel],
    model: str,
    file_path: str,
    # TODO: check if needed
    # project_root: str,
) -> List[TextXError]:
    """Validates given model.

    NOTE: For now returned list will contain maximum one error, since textX does not
          have built-in error recovery mechanism.

    Args:
        metamodel: language metamodel
        model: model
        file_path: A path to the `model` file
        project_root: A path to the root directory where to look for other models
    Returns:
        A list of textX errors or empty list if model is valid
    Raises:
        None

    """
    errors = []
    try:
        metamodel.model_from_str(model, file_name=file_path)
    except TextXError as e:
        errors.append(e)
    return errors
