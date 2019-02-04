from .. import LanguageTemplate


class TextXLang(LanguageTemplate):

    @property
    def extensions(self):
        return ['tx']

    @property
    def language_name(self):
        return 'TextX'
