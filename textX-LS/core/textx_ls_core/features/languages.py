from textx import language_description, language_descriptions

from ..models import TextXLanguage
from ..utils import run_proc_async


def get_languages():
    return [
        TextXLanguage(lang) for lang in language_descriptions().values()
        if lang.name is not 'textX'
    ]


def get_language(language_name):
    return language_description(language_name)


def get_language_metamodel(language_name):
    lang_desc = language_description(language_name)
    lang_mm = lang_desc.metamodel
    return lang_mm() if callable(lang_mm) else lang_mm


async def install_language_async(setuppy_or_wheel, python_path, editable=False, msg_handler=None):
    cmd = [python_path, '-m', 'pip', 'install', setuppy_or_wheel]
    if editable:
        cmd.insert(4, '-e')

    await run_proc_async(cmd, msg_handler)
