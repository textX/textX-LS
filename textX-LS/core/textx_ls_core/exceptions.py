class LanguageManagerError(Exception):
    def __init__(self, cmd, msg):
        super(LanguageManagerError, self).__init__(msg)
        self.cmd = ' '.join(cmd) if isinstance(cmd, list) else cmd

    def __str__(self):
        return "Error while executing command '{}': {}" \
            .format(self.cmd, super(LanguageManagerError, self).__str__())


class LanguageInstallError(LanguageManagerError):
    pass


class LanguageScaffoldError(Exception):
    pass


class LanguageUninstallError(LanguageManagerError):
    pass
