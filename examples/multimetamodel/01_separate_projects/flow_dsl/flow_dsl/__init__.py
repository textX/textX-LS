from textx import metamodel_from_file
import textx.scoping
import textx.scoping.tools as tools
import textx.scoping.providers as scoping_providers
import textx.exceptions
import os
import types_dsl
import data_dsl

_mm_flow = None

def get_metamodel_flow():
    global _mm_flow
    return _mm_flow


def _library_init():
    global _mm_flow
    global_repo = True
    current_dir = os.path.dirname(__file__)

    _mm_flow = metamodel_from_file(os.path.join(current_dir, 'Flow.tx'),
                                   global_repository=global_repo,
                                   referenced_metamodels = [
                                       types_dsl.get_metamodel_types(),
                                       data_dsl.get_metamodel_data()
                                   ])

    textx.scoping.MetaModelProvider.add_metamodel("*.flow", _mm_flow)
    _mm_flow.register_scope_providers(
        {"*.*": scoping_providers.FQNImportURI()})


    def check_flow(f):
        if f.algo1.outp != f.algo2.inp:
            raise textx.exceptions.TextXSemanticError(
                "algo data types must match",
                **tools.get_location(f)
            )

    _mm_flow.register_obj_processors({
        'Flow': check_flow
    })

_library_init()
