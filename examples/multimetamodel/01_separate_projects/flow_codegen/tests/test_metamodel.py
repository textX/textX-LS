from __future__ import unicode_literals
import os


def test_flow_dsl():
    import flow_dsl
    mmF = flow_dsl.get_metamodel_flow()
    current_dir = os.path.dirname(__file__)
    model = mmF.model_from_file(os.path.join(current_dir,
                                             'models',
                                             'data_flow.flow'))
    assert(model is not None)

    import flow_codegen
    txt = flow_codegen.codegen(model)
    assert txt == """@startuml
component A1
component A2
A1 "City" #--# A2
@enduml
"""
