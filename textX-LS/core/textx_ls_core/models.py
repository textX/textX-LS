from typing import Optional

from textx import LanguageDesc


class TextXLanguage:
    """Represents a textX language without metamodel attribute.

    NOTE: Attributes are in camelCase notation needed for client-server automatic
          (de)serialization

    Attributes:
        name (str): language name
        description (str): language description or language name
        projectName (str): project that registers this language

    """

    def __init__(self, lang_desc: LanguageDesc):
        self.name = lang_desc.name
        self.description = lang_desc.description or self.name
        self.projectName = lang_desc.project_name


class TextXProject:
    """Represents a textX project.

    NOTE: Attributes are in camelCase notation needed for client-server automatic
          (de)serialization

    Attributes:
        projectName (str): project name
        editable (bool): if project is installed in editable mode
        distLocation (str): project distribution location
        version (str): project version
        languages (list): languages that are registered by this project

    """

    def __init__(
        self,
        project_name: str,
        editable: bool,
        version: str,
        dist_location: Optional[str] = None,
    ):
        self.projectName = project_name
        self.editable = editable
        self.distLocation = dist_location
        self.version = version
        self.languages = []

    def add_language(self, language: TextXLanguage):
        self.languages.append(language)
