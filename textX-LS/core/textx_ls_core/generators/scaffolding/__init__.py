import shutil
from functools import partial
from os import rename
from os.path import dirname, join, relpath

import jinja2

from ...exceptions import ScaffoldTextXProjectError

templates_path = join(dirname(__file__), "templates")
textx_language_template_path = join(templates_path, "textx-language")


jinja_env = jinja2.Environment(
    loader=jinja2.FileSystemLoader(textx_language_template_path),
    autoescape=True,
    lstrip_blocks=True,
    trim_blocks=True,
)


def _populate_copy(project_name: str, src: str, dest: str) -> str:
    """Populates jinja template."""
    if src.endswith("template"):
        template_rel_path = relpath(src, textx_language_template_path)
        template = jinja_env.get_template(template_rel_path)
        dest = dest.replace(".template", "")
        with open(dest, "w") as f:
            f.write(template.render(project_name=project_name))
        return dest
    else:
        return shutil.copy2(src, dest)


def scaffold_project(project_name: str, dest_dir: str) -> str:
    """Creates a new textX language project in a given destination directory."""
    project_name = project_name.lower()
    dest = join(dest_dir, project_name)

    try:
        # Copy populated project template to dest path
        shutil.copytree(
            textx_language_template_path,
            dest,
            copy_function=partial(_populate_copy, project_name),
        )
        # Rename project name
        rename(join(dest, "project_name"), join(dest, "tx_{}".format(project_name)))

        return dest
    except (shutil.Error, OSError, IOError) as e:
        raise ScaffoldTextXProjectError(project_name, str(e)) from e
