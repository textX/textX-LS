from os.path import dirname, join

from textx import language, metamodel_from_file


@language("Robot", "*.rbt")
def robot():
    "A language for describing robot behavior..."
    return metamodel_from_file(join(dirname(__file__), "robot.tx"))
