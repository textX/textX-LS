from textx import metamodel_from_file

from .. import LanguageTemplate


class TextxfileLang(LanguageTemplate):

    @property
    def extensions(self):
        return ['textxfile']

    @property
    def language_name(self):
        return 'Textxfile'
