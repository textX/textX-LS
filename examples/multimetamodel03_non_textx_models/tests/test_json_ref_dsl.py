from __future__ import unicode_literals
from pytest import raises
import os
import json_ref_dsl
from textx.scoping.tools import get_unique_named_object


def test_json_ref_dsl():
    mm = json_ref_dsl.get_metamodel()
    current_dir = os.path.dirname(__file__)
    my_model = mm.model_from_file(os.path.join(current_dir,
                                             'models',
                                             'ok.jref'))

    # check that the references are OK
    A1_name = get_unique_named_object(my_model, "A1").pyattr
    assert A1_name == "pierre"
    A2_gender = get_unique_named_object(my_model, "A2").pyattr
    assert A2_gender == "male"


def test_json_ref_dsl_bad_attribute():
    mm = json_ref_dsl.get_metamodel()
    current_dir = os.path.dirname(__file__)
    with raises(Exception, match=r'.*noname.*'):
        mm.model_from_file(os.path.join(current_dir,
                                        'models',
                                        'noname.jref'))


def test_json_ref_dsl_bad_filename():
    mm = json_ref_dsl.get_metamodel()
    current_dir = os.path.dirname(__file__)
    with raises(Exception, match=r'.*filenotfound.*'):
        mm.model_from_file(os.path.join(current_dir,
                                        'models',
                                        'filenotfound.jref'))
