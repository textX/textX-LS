from __future__ import unicode_literals
import os
from pytest import raises
import textx.exceptions


def test_flow_dsl():
    import flow_dsl
    mmF = flow_dsl.get_metamodel_flow()
    current_dir = os.path.dirname(__file__)
    model = mmF.model_from_file(os.path.join(current_dir,
                                             'models',
                                             'data_flow.flow'))
    assert(model is not None)
    assert(len(model.algos) == 2)
    assert(len(model.flows) == 1)


def test_flow_dsl_validation():
    import flow_dsl
    mmF = flow_dsl.get_metamodel_flow()
    current_dir = os.path.dirname(__file__)
    with raises(textx.exceptions.TextXSemanticError,
                match=r'.*algo data types must match.*'):
        mmF.model_from_file(os.path.join(current_dir,
                                         'models',
                                         'data_flow_with_error.flow'))

def test_flow_dsl_types_validation():
    import flow_dsl
    mmF = flow_dsl.get_metamodel_flow()
    current_dir = os.path.dirname(__file__)
    with raises(textx.exceptions.TextXSyntaxError,
                match=r'.*lowercase.*'):
        mmF.model_from_file(os.path.join(current_dir,
                                         'models',
                                         'data_flow_including_error.flow'))
