from typing import Any, List, Mapping, Optional

from textx import GeneratorDesc, generator_descriptions, generator_for_language_target

from ..exceptions import GenerateExtensionError, GenerateSyntaxHighlightError
from .projects import get_language_desc, get_languages_by_project_name


def generate_extension(target: str, dest_dir: str, **cmd_args: Optional[dict]) -> None:
    """Generates client installable extension.

    Args:
        target: target (client) to generate extension for (e.g. `vscode`)
        dest_dir: destination directory where extension will be written
        cmd_args: other optional arguments
    Returns:
        None
    Raises:
        GenerateExtensionError: if generator does not exists (`TextXRegistrationError`)
                                or any other error that happened while generating
                                the extension

    """
    try:
        extension_gen = generator_for_language_target("textX", target)
        extension_gen(None, None, dest_dir, **cmd_args)
    except Exception as e:
        raise GenerateExtensionError(target, cmd_args) from e


def generate_syntaxes(
    project_name: str, target: str, **cmd_args: Optional[dict]
) -> Mapping[str, Any]:
    """Generates syntax highlighting files for all project languages.

    NOTE: This is called on grammar changes and it collects new language keywords.
    (project must be installed in editable mode)

    Args:
        project_name: project for which to generate syntax highlightings
        target: syntax highlight file type (e.g. `vscode`)
        cmd_args: other optional arguments
    Returns:
        A map where keys are language names and values are corresponding syntax
        highlighting files
    Raises:
        GenerateSyntaxHighlightError: if generator does not exists (`TextXRegistrationError`)
                                      or any other error that happened while generating
                                      syntax highlighting files

    """
    try:
        syntax_gen = generator_for_language_target("textX", target)

        lang_syntax_map = {}
        for lang in get_languages_by_project_name(project_name):
            lang_name = lang.name.lower()
            lang_desc = get_language_desc(lang_name)
            syntax_file = syntax_gen(
                None, lang_desc.metamodel(), **{"name": lang_name, **cmd_args}
            )
            if syntax_file:
                lang_syntax_map[lang_name] = syntax_file
        return lang_syntax_map
    except Exception as e:
        raise GenerateSyntaxHighlightError(project_name, target) from e


def get_generators() -> List[GeneratorDesc]:
    """Returns all registered generators.

    Args:
        None
    Returns:
        A list of registered textX generators
    Raises:
        None

    """
    return [
        gen
        for target_gens in generator_descriptions().values()
        for gen in target_gens.values()
    ]
