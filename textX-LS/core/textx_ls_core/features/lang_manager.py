import shutil
import subprocess  # nosec
from functools import partial
from os import rename
from os.path import join, relpath

import jinja2

from ..exceptions import (LanguageInstallError, LanguageScaffoldError,
                          LanguageUninstallError)
from ..languages import LANG_MODULES, load_languages_from_entry_points
from ..templates import textx_language_template_path
from ..utils import run

jinja_env = jinja2.Environment(
    loader=jinja2.FileSystemLoader(textx_language_template_path),
    autoescape=True,
    lstrip_blocks=True,
    trim_blocks=True)


def _tx_copy(lang_name, src, dest):
    """Populates jinja template."""
    if src.endswith('template'):
        template_rel_path = relpath(src, textx_language_template_path)
        template = jinja_env.get_template(template_rel_path)
        dest = dest.replace('.template', '')
        with open(dest, 'w') as f:
            f.write(template.render(lang_name=lang_name))
        return dest
    else:
        return shutil.copy2(src, dest)


def install_language(lang_path, python_path, reload_entrypoints=False):
    try:
        cmd = [python_path, "-m", "pip", "install", lang_path]
        stdout = run(cmd)
        if reload_entrypoints:
            load_languages_from_entry_points()
        return stdout
    except subprocess.CalledProcessError as e:
        raise LanguageInstallError(cmd, str(e))


def scaffold_language(lang_name, cwd):
    """Creates a new textX language project in cwd."""
    project_name = 'textx-{}'.format(lang_name)
    dest = join(cwd, project_name)

    try:
        # Copy populated project template to dest path
        shutil.copytree(textx_language_template_path, dest,
                        copy_function=partial(_tx_copy, lang_name))
        # Rename project name
        rename(join(dest, 'lang_name'),
               join(dest, 'textx_{}'.format(lang_name)))

        return dest
    except (shutil.Error, OSError, IOError) as e:
        raise LanguageScaffoldError(str(e))


def uninstall_language(lang_name, python_path, reload_entrypoints=False):
    try:
        lang_pkg = LANG_MODULES[lang_name][1]
        cmd = [python_path, "-m", "pip", "uninstall", lang_pkg, "-y"]
        stdout = run(cmd)
        if reload_entrypoints:
            load_languages_from_entry_points()
        return stdout
    except subprocess.CalledProcessError as e:
        raise LanguageUninstallError(cmd, str(e))
