import shutil
from functools import partial
from os import rename
from os.path import join, relpath

import jinja2

from ..exceptions import LanguageScaffoldingError
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
        dest = dest.replace('.template', '')
        with open(dest, 'w') as f:
            f.write(template.render(lang_name=lang_name))
        return dest
    else:
        return shutil.copy2(src, dest)


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

    except (shutil.Error, OSError, IOError) as e:
        raise LanguageScaffoldingError(str(e))
