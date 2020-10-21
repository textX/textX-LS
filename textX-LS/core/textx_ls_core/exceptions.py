class TextXLSError(Exception):
    """Indicates a generic textX-LS-core error."""

    pass


class GenerateExtensionError(TextXLSError):
    """Indicates an error while generating an extension."""

    def __init__(self, target, cmd_args):
        super().__init__(
            "Failed to generate the extension for '{}' with following arguments: '{}'.".format(
                target, cmd_args
            )
        )
        self.target = target
        self.cmd_args = cmd_args


class GenerateSyntaxHighlightError(TextXLSError):
    """Indicates an error while generating a syntax highlighting data."""

    def __init__(self, project_name, target):
        super().__init__(
            "Failed to generate syntax highlighting for project '{}' and target '{}'.".format(
                project_name, target
            )
        )
        self.project_name = project_name
        self.target = target


class InstallTextXProjectError(TextXLSError):
    """Indicates an error while installing a textX project."""

    def __init__(self, project_name, dist_location, detailed_err_msg):
        super().__init__(
            "Failed to install project: {} ({}).".format(project_name, dist_location)
        )
        self.project_name = project_name
        self.dist_location = dist_location
        self.detailed_err_msg = detailed_err_msg


class UninstallTextXProjectError(TextXLSError):
    """Indicates an error while uninstalling a textX project."""

    def __init__(self, project_name, detailed_err_msg):
        super().__init__("Failed to uninstall project: {}".format(project_name))
        self.project_name = project_name
        self.detailed_err_msg = detailed_err_msg


class LanguageNotRegistered(TextXLSError):
    """Indicates an error if language can't be parsed with any of registered metamodels."""

    def __init__(self, file_name):
        super().__init__(
            "There are no metamodels that can parse '{}'.".format(file_name)
        )


class MultipleLanguagesError(TextXLSError):
    """Indicates an error if language can be parsed with multiple registered metamodels."""

    def __init__(self, file_name):
        super().__init__(
            "Multiple languages can parse '{}'. Install appropriate extension and select language id.".format(
                file_name
            )
        )
