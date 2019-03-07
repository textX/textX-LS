from functools import partial
from os import rename
from os.path import join, relpath
from pathlib import Path
from shutil import copy2, copytree

import jinja2

from ..templates import textx_language_template_path

jinja_env = jinja2.Environment(
    loader=jinja2.FileSystemLoader(textx_language_template_path),
    trim_blocks=True,
    lstrip_blocks=True)


def _tx_copy(lang_name, src, dest):
    """Populates jinja template."""
    if src.endswith('template'):
        template_rel_path = relpath(src, textx_language_template_path)
        template = jinja_env.get_template(template_rel_path)
        with open(dest.replace('.template', ''), 'w') as f:
            f.write(template.render(lang_name=lang_name))
    else:
        copy2(src, dest)


def scaffold_language(lang_name, cwd):
    """Creates a new textX language project in cwd."""
    project_name = 'textx-{}'.format(lang_name)

    path = Path(join(cwd, project_name))

    if path.is_dir():
        return False, "Path {} already exists".format(path)

    copytree(textx_language_template_path, path,
             copy_function=partial(_tx_copy, lang_name))
    rename(join(path, 'lang_name'), join(path, 'textx_{}'.format(lang_name)))
