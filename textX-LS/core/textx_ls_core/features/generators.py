from os.path import join

from textx import (LanguageDesc, generator_descriptions,
                   generator_for_language_target)
from textx.exceptions import TextXRegistrationError

from ..exceptions import GeneratorNotExist
from .projects import get_language

extension_gen = None


def generate_extension(project_name, target, dest_dir):
    global extension_gen
    if extension_gen is None:
        try:
            extension_gen = generator_for_language_target('textX', target)
        except TextXRegistrationError:
            raise GeneratorNotExist("Extension generator not exist for {}"
                                    .format(target))

    extension_gen(None, None, dest_dir, **{
        'project': project_name,
        'vsix': 1
    })

    return join(dest_dir, project_name + '.vsix')


def get_generators():
    return [
        gen for target_gens in generator_descriptions().values() for gen in target_gens.values()
    ]
