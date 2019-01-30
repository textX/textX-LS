import functools

import click

from ..features.validate import validate as _validate
from ..languages import LANGUAGES
from ..utils import get_file_extension


def get_lang_and_load_model(func):
    """Decorator which gets language template depending on file extension and
    to load model from path."""
    @functools.wraps(func)
    def decorator(model_file):
        file_ext = get_file_extension(model_file).lower()
        try:
            lang_template = LANGUAGES[file_ext]
            with open(model_file) as f:
                return func(lang_template, f.read())
        except KeyError:
            click.secho('File with extension "{}" is not supported'
                        .format(file_ext))
        except IOError:
            click.secho('File "{}" not found.'.format(model_file))
    return decorator


def create_textxls_cli(textx_cli):
    model_arg = click.argument('model_file', type=click.Path(), required=True)

    @textx_cli.group('ls')
    def textxls():
        """textxls group sub-commands."""
        pass

    @textxls.command()
    def langs():    # pylint: disable=unused-variable
        """
        Show supported languages.
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

    @textxls.command()
    @model_arg
    @get_lang_and_load_model
    def validate(lang, model_str):  # pylint: disable=unused-variable
        """Validates model if it is supported."""
        lang_name = lang.language_name
        errors = _validate(lang, model_str)
        if not errors:
            click.secho('[{}] Model OK.'
                        .format(lang_name), fg='green')
        else:
            msg = '[{}] Model is not valid:'.format(lang_name)
            click.secho(msg, fg='red')
            for e in errors:
                click.secho('- {}'.format(str(e)), fg='yellow')
