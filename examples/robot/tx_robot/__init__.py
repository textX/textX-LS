from os.path import dirname, join

from textx import LanguageDesc, metamodel_from_file

NAME = "Robot"
PATTERN = "*.rbt"
DESCRIPTION = "A language for describing robot behavior..."
METAMODEL = metamodel_from_file(join(dirname(__file__), "robot.tx"))

RobotLang = LanguageDesc(
    name=NAME, pattern=PATTERN, description=DESCRIPTION, metamodel=METAMODEL
)
