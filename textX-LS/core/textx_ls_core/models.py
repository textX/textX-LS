from textx import LanguageDesc


class TextXLanguage:
    def __init__(self, lang_desc: LanguageDesc):
        self.name = lang_desc.name
        self.description = lang_desc.description or self.name
        self.projectName = lang_desc.project_name
