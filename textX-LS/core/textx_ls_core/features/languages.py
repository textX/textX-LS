from textx import generator_descriptions, language_descriptions

from ..models import TextXLanguage


def get_generators():
    return [
        gen for target_gens in generator_descriptions().values() for gen in target_gens.values()
    ]


def get_languages():
    return [
        TextXLanguage(lang) for lang in language_descriptions().values()
        if lang.name is not 'textX'
    ]
