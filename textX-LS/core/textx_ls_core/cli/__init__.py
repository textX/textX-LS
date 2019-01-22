import click
import pkg_resources


class TextXLSCLI(click.MultiCommand):

    def list_commands(self, ctx):
        commands = []
        for ep in pkg_resources.iter_entry_points(group='textxls_commands'):
            commands.append(ep.name)
        return commands

    def get_command(self, ctx, name):
        for ep in pkg_resources.iter_entry_points(group='textxls_commands'):
            if ep.name == name:
                return ep.load()


textxls = TextXLSCLI(help='TextX Language Smartness Provider')
