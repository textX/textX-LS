from inspect import getfile
from os.path import dirname, join
from typing import List

import pkg_resources as pkg
from textx import metamodel_from_file
from textx.metamodel import TextXMetaModel


class LanguageTemplate:

    def __init__(self, auto_load_mm=True):
        if auto_load_mm:
            self._metamodel = metamodel_from_file(
                join(dirname(getfile(self.__class__)), 'grammar.tx'))

    @property
    def extensions(self) -> List[str]:
        raise NotImplementedError()

    @property
    def language_name(self) -> str:
        raise NotImplementedError()

    @property
    def metamodel(self) -> TextXMetaModel:
        return self._metamodel

    def rule_completions(self, rule):
        """Not supported for now, but the idea is customize code completion for
        given rule.
        """
        raise NotImplementedError()

    def __repr__(self):
        return "{}".format(self.language_name)


# Supported languages
LANGUAGES = {}          # Dict[str, LanguageTemplate]
LANG_EXTENSIONS = ()    # Tuple[str]
LANG_MODULES = {}  # lang_name: lang_name, lang_module, builtin


def load_languages_from_entry_points():
    LANGUAGES.clear()
    LANG_MODULES.clear()

    for ep in pkg.WorkingSet().iter_entry_points(group='textxls_langs'):
        lang_template_cls = ep.load()
        lang_template = lang_template_cls()
        for ext in lang_template.extensions:
            LANGUAGES[ext.lower()] = lang_template

        lang_name = lang_template.language_name
        lang_module = ep.module_name
        is_builtin = lang_module.startswith('textx_ls_core')
        LANG_MODULES[lang_name] = (lang_name, lang_module, is_builtin)

    global LANG_EXTENSIONS
    LANG_EXTENSIONS = list(LANGUAGES.keys())


load_languages_from_entry_points()
