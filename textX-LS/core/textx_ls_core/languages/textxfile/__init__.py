from .. import LanguageTemplate, register_language


@register_language()
class TextxfileTemplate(LanguageTemplate):
    @property
    def extensions(self):
        return ['textxfile']

    @property
    def language_name(self):
        return 'Textxfile'

    @property
    def metamodel(self):
        pass
