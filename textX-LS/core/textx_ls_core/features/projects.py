import sys
from typing import Callable, List, Optional, Tuple

from pkg_resources import DistributionNotFound, get_distribution

from textx import (
    LanguageDesc,
    clear_language_registrations,
    language_description,
    language_descriptions,
    languages_for_file,
)
from textx.exceptions import TextXRegistrationError

from ..exceptions import (
    InstallTextXProjectError,
    LanguageNotRegistered,
    MultipleLanguagesError,
    UninstallTextXProjectError,
)
from ..models import TextXLanguage, TextXProject
from ..utils import (
    compare_project_names,
    dist_is_editable,
    get_project_name_and_version,
    run_async,
)

BUILT_IN_LANGUAGES = ["textx", "txcl"]


def get_languages() -> List[TextXLanguage]:
    """Returns all registered languages.

    Args:
        None
    Returns:
        A list of registered textX languages
    Raises:
        None

    """
    return [
        TextXLanguage(lang)
        for lang in language_descriptions().values()
        if lang.name.lower() not in BUILT_IN_LANGUAGES
    ]


def get_languages_by_project_name(project_name: str) -> List[TextXLanguage]:
    """Returns all project languages.

    Args:
        project_name: textX project
    Returns:
        A list of textX project languages
    Raises:
        None

    """
    return [
        lang
        for lang in get_languages()
        if compare_project_names(lang.projectName, project_name)
    ]


def get_language_desc(
    language_name: str, file_name: Optional[str] = None
) -> LanguageDesc:
    """Returns a language info by a given language name or file extension.

    Args:
        language_name: textX language name (id)
        file_name: file path of active document
    Returns:
        A language info (`LanguageDesc`)
    Raises:
        MultipleLanguagesError: If there are multiple registered metamodels that can
                                parse a language
        LanguageNotRegistered: If there are no registered metamodels that can parse a
                               language

    """
    lang_desc = None
    try:
        lang_desc = language_description(language_name)
    except TextXRegistrationError:
        # When client does not set language id/name, i.e. extension is not
        # installed, then try to load by file extension
        lang_descs = languages_for_file(file_name)
        lang_descs_len = len(lang_descs)
        if lang_descs_len > 1:
            raise MultipleLanguagesError(file_name)

        lang_desc = lang_descs.pop() if lang_descs_len == 1 else None

    if lang_desc is None:
        raise LanguageNotRegistered(file_name)

    return lang_desc


def get_projects(with_langs: Optional[bool] = True) -> List[TextXProject]:
    """Returns all textX language projects.

    NOTE: Project is a python package which registers textX languages and generators
    via entry points

    Args:
        with_langs: include language instances
    Returns:
        A list of textX projects
    Raises:
        None

    """
    projects = {}
    for lang in get_languages():
        project_name = lang.projectName
        if project_name not in projects:
            dist = get_distribution(project_name)
            dist_location = dist.location
            editable = dist_is_editable(dist_location, project_name)
            projects[project_name] = TextXProject(
                project_name, editable, dist.version, dist_location
            )
        if with_langs is True:
            projects[project_name].add_language(lang)
    return projects


async def install_project_async(
    folder_or_wheel: str,
    python_path: str,
    editable: Optional[str] = False,
    msg_handler: Optional[Callable] = None,
) -> Tuple[str, str, str]:
    """Installs textX project.

    Args:
        folder_or_wheel: path to the folder or wheel of textX language project
        python_path: python path from virtual environment that extension is using
        editable: flag if project should be installed in editable mode
        msg_handler: a callable which is called with message argument when process writes to stdout
    Returns:
        A tuple of project name, version and package dist location if project is installed successfully
    Raises:
        InstallTextXProjectError: If project is not installed

    """
    project_name, version = get_project_name_and_version(folder_or_wheel)
    dist_location = None

    cmd = [python_path, "-m", "pip", "install", folder_or_wheel]
    if editable:
        cmd.insert(4, "-e")

    retcode, output = await run_async(cmd, msg_handler)

    # Not installed
    if retcode != 0:
        raise InstallTextXProjectError(project_name, folder_or_wheel, output)

    # Manually add package to sys.path if installed with -e flag
    if editable and folder_or_wheel not in sys.path:
        sys.path.append(folder_or_wheel)

    clear_language_registrations()

    # Checks if language with the same name already exist
    try:
        language_descriptions()
        dist_location = get_distribution(project_name).location
    except Exception as e:
        await uninstall_project_async(project_name, python_path)
        raise InstallTextXProjectError(project_name, dist_location, output) from e

    return project_name, version, dist_location


async def uninstall_project_async(
    project_name: str, python_path: str, msg_handler: Optional[Callable] = None
) -> None:
    """Uninstalls textX project.

    Args:
        project_name: project name
        python_path: python path from virtual environment that extension is using
        msg_handler: a callable which is called with message argument when process writes to stdout
    Returns:
        None
    Raises:
        UninstallTextXProjectError: If project is not uninstalled
        DistributionNotFound: If package dist is not found

    """
    cmd = [python_path, "-m", "pip", "uninstall", project_name, "-y"]

    # Get dist location before uninstalling with pip
    try:
        dist_location = get_distribution(project_name).location
    except DistributionNotFound as e:
        raise UninstallTextXProjectError(project_name, "") from e

    # Call pip uninstall command
    retcode, output = await run_async(cmd, msg_handler)
    if retcode != 0:
        raise UninstallTextXProjectError(project_name, output)

    # Manually remove package from sys.path if needed
    is_editable = dist_is_editable(dist_location, project_name)
    if is_editable and dist_location in sys.path:
        sys.path.remove(dist_location)

    clear_language_registrations()
