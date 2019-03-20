from __future__ import unicode_literals
from pytest import raises
import os
import textx.exceptions


def test_types_dsl():
    import types_data_flow_dsls
    mmT = types_data_flow_dsls.get_metamodel_types()
    current_dir = os.path.dirname(__file__)
    model = mmT.model_from_file(os.path.join(current_dir,
                                             'models',
                                             'types.type'))
    assert(model is not None)
    assert(len(model.types) == 2)


def test_types_dsl_validation():
    import types_data_flow_dsls
    mmT = types_data_flow_dsls.get_metamodel_types()
    current_dir = os.path.dirname(__file__)
    with raises(textx.exceptions.TextXSyntaxError,
                match=r'.*lowercase.*'):
        mmT.model_from_file(os.path.join(current_dir,
                                         'models',
                                         'types_with_error.type'))


def test_data_dsl():
    import types_data_flow_dsls
    mmD = types_data_flow_dsls.get_metamodel_data()
    current_dir = os.path.dirname(__file__)
    model = mmD.model_from_file(os.path.join(current_dir,
                                             'models',
                                             'data_structures.data'))
    assert(model is not None)
    assert(len(model.data) == 3)


def test_flow_dsl():
    import types_data_flow_dsls
    mmD = types_data_flow_dsls.get_metamodel_flow()
    current_dir = os.path.dirname(__file__)
    model = mmD.model_from_file(os.path.join(current_dir,
                                             'models',
                                             'data_flow.flow'))
    assert(model is not None)
    assert(len(model.algos) == 2)
    assert(len(model.flows) == 1)


def test_flow_dsl_validation():
    import types_data_flow_dsls
    mmF = types_data_flow_dsls.get_metamodel_flow()
    current_dir = os.path.dirname(__file__)
    with raises(textx.exceptions.TextXSemanticError,
                match=r'.*algo data types must match.*'):
        mmF.model_from_file(os.path.join(current_dir,
                                         'models',
                                         'data_flow_with_error.flow'))
