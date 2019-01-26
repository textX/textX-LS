import click

from ..languages import LANGUAGES


def create_textxls_cli(textx_cli):
    @textx_cli.group()
    def textxls():
        """textxls group sub-commands."""
        pass

    @textxls.command()
    def langs():    # pylint: disable=unused-variable
        """
        Show registered languages.
        """
        data = []

        # Add table header
        data.append(['Language name', 'Language Extensions'])
        header_style = {'bold': True, 'fg': 'green'}

        for lang in LANGUAGES.values():
            data.append([lang.language_name, ', '.join(lang.extensions)])

        # Took from here https://stackoverflow.com/a/12065663/9669050
        widths = [max(map(len, col)) for col in zip(*data)]

        for idx, row in enumerate(data):
            style = header_style if idx == 0 else {}
            click.secho('\t'.join((val.ljust(width)
                                   for val, width
                                   in zip(row, widths))), **style)
