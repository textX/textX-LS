from inspect import getfile
from os.path import dirname, join

from textx import LanguageDesc, metamodel_from_file

# from textx_ls_core.languages import LanguageTemplate

NAME = "Workflow"
PATTERN = '*.wf'
DESCRIPTION = 'A language for describing workflows...'
METAMODEL = metamodel_from_file(join(dirname(__file__), 'workflow.tx'))

WorkflowLang = LanguageDesc(
    name=NAME,
    pattern=PATTERN,
    description=DESCRIPTION,
    metamodel=METAMODEL)
