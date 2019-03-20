from textx import metamodel_from_file, get_model
import textx.scoping
import os

_mm = None


def get_metamodel():
    global _mm
    return _mm


def _library_init():
    global _mm
    global_repo = True
    current_dir = os.path.dirname(__file__)

    _mm = metamodel_from_file(os.path.join(current_dir, 'JsonRef.tx'),
                              global_repository=global_repo)
    textx.scoping.MetaModelProvider.add_metamodel("*.jref", _mm)

    def json_scope_provider(obj, attr, attr_ref):
        if not obj.pyobj:
            from textx.scoping import Postponed
            return Postponed()
        if not hasattr(obj.pyobj, "data"):
            import json
            obj.pyobj.data = json.load(open(
                os.path.join(os.path.abspath(os.path.dirname(
                    get_model(obj)._tx_filename)),
                    obj.pyobj.filename)))
        if attr_ref.obj_name in obj.pyobj.data:
            return obj.pyobj.data[attr_ref.obj_name]
        else:
            raise Exception("{} not found".format(attr_ref.obj_name))

    _mm.register_scope_providers(
        {"Access.pyattr": json_scope_provider})


_library_init()
