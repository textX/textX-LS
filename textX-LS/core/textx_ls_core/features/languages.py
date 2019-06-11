import sys

from pkg_resources import get_distribution
from textx import (clear_language_registrations, language_description,
                   language_descriptions, languages_for_file)
from textx.exceptions import TextXRegistrationError

from ..exceptions import LanguageNotRegistered, MultipleLanguagesError
from ..models import TextXLanguage
from ..utils import (compare_project_names, get_project_name_and_version,
                     run_proc_async)


def get_languages():
    return [
        TextXLanguage(lang) for lang in language_descriptions().values()
        if lang.name is not 'textX'
    ]


def get_language(language_name):
    return language_description(language_name)


def get_languages_by_project_name(project_name):
    langs = []
    for lang in get_languages():
        if compare_project_names(lang.projectName, project_name):
            langs.append(lang)
    return langs


def get_language_metamodel(language_name, file_name=None):
    lang_desc = None
    try:
        lang_desc = language_description(language_name)
    except TextXRegistrationError:
        # When client does not set language id/name, i.e. extension is not
        # installed, then try to load by file extension
        lang_descs = languages_for_file(file_name)
        lang_descs_len = len(lang_descs)
        if lang_descs_len > 1:
            raise MultipleLanguagesError(
                'Multiple languages can parse "{}". Skipping.'
                .format(file_name))
        lang_desc = lang_descs.pop() if lang_descs_len == 1 else None

    if lang_desc is None:
        raise LanguageNotRegistered('No language registered that can parse'
                                    ' "{}".'.format(file_name))

    lang_mm = lang_desc.metamodel
    return lang_mm() if callable(lang_mm) else lang_mm


async def install_project_async(folder_or_wheel, python_path, editable=False,
                                msg_handler=None):
    project_name, version = get_project_name_and_version(folder_or_wheel)
    is_installed = False

    # TODO: Check if project with the same version is already installed ?

    cmd = [python_path, '-m', 'pip', 'install', folder_or_wheel]
    if editable:
        cmd.insert(4, '-e')

    retcode = await run_proc_async(cmd, msg_handler)

    # Successfully installed
    if retcode == 0:
        clear_language_registrations()
        # Manually add package to sys.path if installed with -e flag
        if editable and folder_or_wheel not in sys.path:
            sys.path.append(folder_or_wheel)
        is_installed = True

    return is_installed, project_name


async def uninstall_project_async(project_name, python_path,
                                  msg_handler=None):
    cmd = [python_path, '-m', 'pip', 'uninstall', project_name, '-y']

    # Get dist location before uninstalling with pip
    dist_location = get_distribution(project_name).location

    # lang_name = None
    # lang = get_language_by_project_name(project_name)
    # if lang:
    #     lang_name = lang.name

    # retcode = await run_proc_async(cmd, msg_handler)

    # if retcode != 0:
    #     return False, lang_name

    # # Manually remove package from sys.path if needed
    # if dist_location in sys.path:
    #     sys.path.remove(dist_location)

    # clear_language_registrations()
    # return True, lang_name
