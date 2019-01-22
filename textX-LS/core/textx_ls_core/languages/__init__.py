import pkg_resources as pkg
from textx import metamodel_from_file


class LanguageTemplate:

    @property
    def extensions(self):
        raise NotImplementedError()

    @property
    def language_name(self):
        raise NotImplementedError()

    @property
    def metamodel(self):
        raise NotImplementedError()

    def __repr__(self):
        return "{}".format(self.language_name)


LANGUAGES = {}


def get_lang_template_by_ext(extension, reload_entry_points=False):
    return LANGUAGES.get(extension, None)


def register_language():
    def decorator(template_cls: LanguageTemplate):
        inst = template_cls()
        for ext in inst.extensions:
            LANGUAGES[ext] = inst
        return template_cls
    return decorator


def reload_entry_points(self):
    for entry_point in pkg.iter_entry_points(group='textx_lang'):
        template_cls = entry_point.load()
        self.register_language()(template_cls)
