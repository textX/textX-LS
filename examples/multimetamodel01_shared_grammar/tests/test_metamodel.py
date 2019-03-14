from __future__ import unicode_literals
from pytest import raises
import os
import textx.exceptions


def test_types_dsl():
    import types_data_flow_dsls
    mmT = types_data_flow_dsls.get_metamodel_types()
    current_dir = os.path.dirname(__file__)
    model = mmT.model_from_file(os.path.join(current_dir,
                                             'types_data_flow',
                                             'types.type'))
    assert(model is not None)
    assert(len(model.types) == 2)

    with raises(textx.exceptions.TextXSyntaxError,
                match=r'.*lowercase.*'):
        mmT.model_from_file(os.path.join(current_dir,
                                         'types_data_flow',
                                         'types_with_error.type'))


def test_data_dsl():
    import types_data_flow_dsls
    mmD = types_data_flow_dsls.get_metamodel_data()
    current_dir = os.path.dirname(__file__)
    model = mmD.model_from_file(os.path.join(current_dir,
                                             'types_data_flow',
                                             'data_structures.data'))
    assert(model is not None)
    assert(len(model.data) == 3)


def test_flow_dsl():
    import types_data_flow_dsls
    mmD = types_data_flow_dsls.get_metamodel_flow()
    current_dir = os.path.dirname(__file__)
    model = mmD.model_from_file(os.path.join(current_dir,
                                             'types_data_flow',
                                             'data_flow.flow'))
    assert(model is not None)
    assert(len(model.algos) == 2)
    assert(len(model.flows) == 1)
