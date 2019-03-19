# Example json_ref_dsl

A DSL to demonstrate how to combine a textx model with a json model/file.


## Install

In a virtualenv, install the package

	virtualenv venv -p $(which python3)
	source ./venv/bin/activate
	pip install -r requirements_dev.txt
	pip install -e .


## Test

	python -m pytest tests

Or check coding guidelines

	flake8

## Manual tests

Manual checks:

	cd tests/models
	json_ref_dsl_validate ok.jref 

Expected outcome:

	validating ok.jref
	A1 --> pierre: ok
	A2 --> male: ok

