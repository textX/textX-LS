from os import linesep


class TextXLSError(Exception):
    """Indicates a generic textX-LS-core error."""

    pass


class GenerateExtensionError(TextXLSError):
    """Indicates an error while generating an extension."""

    pass


class GenerateSyntaxHighlightError(TextXLSError):
    """Indicates an error while generating a syntax highlighting data."""

    pass


class InstallTextXProjectError(TextXLSError):
    """Indicates an error while installing a textX project."""

    def __init__(self, project_name, dist_location, err_msg):
        super().__init__(
            (
                "Project {} (at {}) installing failed due to:".format(
                    project_name, dist_location
                ),
                linesep,
                err_msg,
            )
        )


class UninstallTextXProjectError(TextXLSError):
    """Indicates an error while uninstalling a textX project."""

    def __init__(self, project_name, err_msg):
        super().__init__(
            (
                "Project {} uninstalling failed due to:".format(project_name),
                linesep,
                err_msg,
            )
        )


class LanguageNotRegistered(TextXLSError):
    """Indicates an error if language can't be parsed with any of registered metamodels.
    """

    pass


class MultipleLanguagesError(TextXLSError):
    """Indicates an error if language can be parsed with multiple registered metamodels.
    """

    pass
