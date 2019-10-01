from functools import lru_cache
from os.path import join

from textx import LanguageDesc, generator_descriptions, generator_for_language_target
from textx.exceptions import TextXRegistrationError

from ..exceptions import GeneratorNotExist
from .projects import get_language, get_language_desc, get_languages_by_project_name


@lru_cache()
def get_generator(language, target):
    try:
        return generator_for_language_target(language, target)
    except TextXRegistrationError:
        raise GeneratorNotExist("Extension generator not exist for {}".format(target))


def generate_extension(project_name, target, dest_dir, editable):
    extension_gen = get_generator("textX", target)

    if editable:
        cmd_args = {"project_name": project_name, "vsix": 1, "skip_keywords": 1}
    else:
        cmd_args = {"project_name": project_name, "vsix": 1}

    extension_gen(None, None, dest_dir, **cmd_args)
    return join(dest_dir, project_name + ".vsix")


def generate_syntaxes(project_name, target):
    syntax_gen = get_generator("textX", target)

    lang_syntax_map = {}
    for lang in get_languages_by_project_name(project_name):
        lang_name = lang.name.lower()
        lang_desc = get_language_desc(lang_name)
        syntax_file = syntax_gen(
            None, lang_desc.metamodel(), **{"name": lang_name, "silent": 1}
        )
        if syntax_file:
            lang_syntax_map[lang_name] = syntax_file
    return lang_syntax_map


def get_generators():
    return [
        gen
        for target_gens in generator_descriptions().values()
        for gen in target_gens.values()
    ]
