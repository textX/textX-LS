from os.path import dirname, join

from textx import language, metamodel_from_file


@language("Workflow", "*.wf")
def workflow():
    "A language for describing workflows..."
    return metamodel_from_file(join(dirname(__file__), "workflow.tx"))
