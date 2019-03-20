from textx import metamodel_from_file
import textx.scoping
import textx.scoping.providers as scoping_providers
import types_dsl
import os

_mm_data = None


def get_metamodel_data():
    global _mm_data
    return _mm_data


def _library_init():
    global _mm_data
    global_repo = True
    current_dir = os.path.dirname(__file__)
    p = os.path.join(current_dir, 'Data.tx')
    _mm_data = metamodel_from_file(p,
                                   global_repository=global_repo,
                                   referenced_metamodels=[
                                       types_dsl.get_metamodel_types()])
    textx.scoping.MetaModelProvider.add_metamodel("*.data", _mm_data)
    _mm_data.register_scope_providers(
        {"*.*": scoping_providers.FQNImportURI()})


_library_init()
