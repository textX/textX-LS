class TextXLSError(Exception):
    pass


class LanguageNotRegistered(TextXLSError):
    pass


class MultipleLanguagesError(TextXLSError):
    pass
