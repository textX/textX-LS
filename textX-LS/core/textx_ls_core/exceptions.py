class TextXLSError(Exception):
    pass


class GeneratorNotExist(TextXLSError):
    pass


class LanguageNotRegistered(TextXLSError):
    pass


class MultipleLanguagesError(TextXLSError):
    pass
