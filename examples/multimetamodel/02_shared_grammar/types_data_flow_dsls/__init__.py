from textx import metamodel_from_file
import textx.scoping
import textx.scoping.providers as scoping_providers
import textx.scoping.tools as tools
import os

_mm_types = None
_mm_data = None
_mm_flow = None


def get_metamodel_types():
    global _mm_types
    return _mm_types


def get_metamodel_data():
    global _mm_data
    return _mm_data


def get_metamodel_flow():
    global _mm_flow
    return _mm_flow


def _library_init():
    global _mm_types, _mm_data, _mm_flow
    global_repo = True
    current_dir = os.path.dirname(__file__)

    # --------------------------------------------------------------------------

    _mm_types = metamodel_from_file(os.path.join(current_dir, 'Types.tx'),
                                    global_repository=global_repo)
    textx.scoping.MetaModelProvider.add_metamodel("*.type", _mm_types)

    def check_type(t):
        if t.name[0].isupper():
            raise textx.exceptions.TextXSyntaxError(
                "types must be lowercase",
                **tools.get_location(t)
            )

    _mm_types.register_obj_processors({
        'Type': check_type
    })

    # --------------------------------------------------------------------------

    _mm_data = metamodel_from_file(os.path.join(current_dir, 'Data.tx'),
                                   global_repository=global_repo)
    textx.scoping.MetaModelProvider.add_metamodel("*.data", _mm_data)
    _mm_data.register_scope_providers(
        {"*.*": scoping_providers.FQNImportURI()})

    # --------------------------------------------------------------------------

    _mm_flow = metamodel_from_file(os.path.join(current_dir, 'Flow.tx'),
                                   global_repository=global_repo)
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
