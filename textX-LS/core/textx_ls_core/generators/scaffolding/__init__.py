import shutil
from functools import partial
from os import rename
from os.path import dirname, exists, join, relpath

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
    """Populates jinja template.

    Args:
        project_name: project name
        src: source directory path
        dest: destination directory path
    Returns:
        Destination directory path where template is coppied to
    Raises:
        None

    """
    if src.endswith("template"):
        template_rel_path = relpath(src, textx_language_template_path)
        template = jinja_env.get_template(template_rel_path)
        dest = dest.replace(".template", "")
        with open(dest, "w") as f:
            f.write(template.render(project_name=project_name))
        return dest
    else:
        return shutil.copy2(src, dest)


def scaffold_language_project(project_name: str, dest_dir: str) -> str:
    """Creates a new textX language project in a given destination directory.

    Args:
        project_name: project name
        dest_dir: destination directory path where language project is scaffolded
    Returns:
        same as `dest_dir`
    Raises:
        ScaffoldTextXProjectError: If any of `shutil.Error`, `OSError`, `IOError` error
                                   types occurs

    """
    project_name = project_name.lower()
    dest = join(dest_dir, project_name)

    if exists(dest):
        raise ScaffoldTextXProjectError(
            project_name,
            "Project with name {} already exist at {}".format(project_name, dest),
        )

    try:
        # Copy populated project template to dest path
        shutil.copytree(
            textx_language_template_path,
            dest,
            copy_function=partial(_populate_copy, project_name),
        )
        # Rename project name
        rename(join(dest, "tx_package_name"), join(dest, "tx_{}".format(project_name)))

        return dest
    except (shutil.Error, OSError, IOError) as e:
        shutil.rmtree(dest)
        raise ScaffoldTextXProjectError(project_name, str(e)) from e
