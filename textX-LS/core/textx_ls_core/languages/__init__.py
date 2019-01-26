from inspect import getfile
from os.path import dirname, join

import pkg_resources as pkg
from textx import metamodel_from_file


class LanguageTemplate:

    def __init__(self):
        self._metamodel = metamodel_from_file(
            join(dirname(getfile(self.__class__)), 'grammar.tx'))

    @property
    def extensions(self):
        raise NotImplementedError()

    @property
    def language_name(self):
        raise NotImplementedError()

    @property
    def metamodel(self):
        return self._metamodel

    def __repr__(self):
        return "{}".format(self.language_name)


LANGUAGES = {}
LANG_EXTENSIONS = ()


def get_lang_template_by_ext(extension, reload_entry_points=False):
    return LANGUAGES.get(extension, None)


def load_languages_from_entry_points():
    for entry_point in pkg.iter_entry_points(group='textxls_langs'):
        lang_template_cls = entry_point.load()
        lang_template = lang_template_cls()
        for ext in lang_template.extensions:
            LANGUAGES[ext.lower()] = lang_template

    global LANG_EXTENSIONS
    LANG_EXTENSIONS = list(LANGUAGES.keys())


load_languages_from_entry_points()
