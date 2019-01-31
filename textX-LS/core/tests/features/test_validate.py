from textx.exceptions import TextXSemanticError, TextXSyntaxError
from textx_ls_core.features.validate import validate

VALID_MODEL = '''
package main

type float64

func test(x float64) float64 { }
'''

SEMANTIC_ERROR_MODEL = '''
package main

type float64

func test(x float64) float32 { }
'''

SYNTAX_ERROR_MODEL = '''
pckg main
'''


def test_validate_should_return_empty_list(lang_template):
    errors = validate(lang_template, VALID_MODEL)
    assert errors == []


def test_validate_should_return_semantic_error(lang_template):
    errors = validate(lang_template, SEMANTIC_ERROR_MODEL)
    assert isinstance(errors[0], TextXSemanticError)


def test_validate_should_return_syntax_error(lang_template):
    errors = validate(lang_template, SYNTAX_ERROR_MODEL)
    assert isinstance(errors[0], TextXSyntaxError)
