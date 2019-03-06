from inspect import getfile
from os.path import dirname, join

from textx import metamodel_from_file
from textx_ls_core.languages import LanguageTemplate


class WorkflowLang(LanguageTemplate):

    def __init__(self):
        super(WorkflowLang, self).__init__(auto_load_mm=False)

        self._metamodel = metamodel_from_file(
            join(dirname(getfile(self.__class__)), 'workflow.tx'))

    @property
    def extensions(self):
        return ['wf']

    @property
    def language_name(self):
        return 'Workflow'
