from textx import LanguageDesc


class TextXLanguage:
    def __init__(self, lang_desc: LanguageDesc):
        self.name = lang_desc.name
        self.description = lang_desc.description or self.name
        try:
            self.metamodel_path = lang_desc.metamodel.file_name
        except:
            self.metamodel_path = None
