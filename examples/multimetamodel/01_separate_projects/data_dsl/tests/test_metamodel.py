from __future__ import unicode_literals
import os


def test_data_dsl():
    import data_dsl
    mmD = data_dsl.get_metamodel_data()
    current_dir = os.path.dirname(__file__)
    model = mmD.model_from_file(os.path.join(current_dir,
                                             'models',
                                             'data_structures.data'))
    assert(model is not None)
    assert(len(model.data) == 3)
