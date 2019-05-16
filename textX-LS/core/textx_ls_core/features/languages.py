from textx import (clear_language_registrations, language_description,
                   language_descriptions, languages_for_file)
from textx.exceptions import TextXRegistrationError

from ..exceptions import LanguageNotRegistered, MultipleLanguagesError
from ..models import TextXLanguage
from ..utils import run_proc_async


def get_languages():
    return [
        TextXLanguage(lang) for lang in language_descriptions().values()
        if lang.name is not 'textX'
    ]


def get_language(language_name):
    return language_description(language_name)


def get_language_metamodel(language_name, file_name):
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


async def install_language_async(folder_or_wheel, python_path, editable=False,
                                 msg_handler=None):
    cmd = [python_path, '-m', 'pip', 'install', folder_or_wheel]
    if editable:
        cmd.insert(4, '-e')

    retcode = await run_proc_async(cmd, msg_handler)

    if retcode == 0:
        # Manually add package to sys.path if installed with -e flag
        if editable:
            import sys
            sys.path.append(folder_or_wheel)

        clear_language_registrations()
        # TODO: Notify client . . .
