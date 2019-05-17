from os.path import join

from textx import (LanguageDesc, generator_descriptions,
                   generator_for_language_target)
from textx.exceptions import TextXRegistrationError

from ..exceptions import GeneratorNotExist
from .languages import get_language

extension_gen = None


def generate_extension(lang_name, target, dest_dir):
    global extension_gen
    if extension_gen is None:
        try:
            extension_gen = generator_for_language_target('textX', target)
        except TextXRegistrationError:
            raise GeneratorNotExist("Extension generator not exist for {}"
                                    .format(target))

    lang = get_language(lang_name)

    extension_gen(None, lang.metamodel, dest_dir, **{
        'lang-name': lang.name,
        'pattern': lang.pattern,
        'vsix': 1
    })

    return join(dest_dir, lang.name + '.vsix')


def get_generators():
    return [
        gen for target_gens in generator_descriptions().values() for gen in target_gens.values()
    ]
