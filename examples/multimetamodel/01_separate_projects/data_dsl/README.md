# data dsl

Prepare:

	virtualenv venv -p $(which python3)
	source ./venv/bin/activate
	pip install -r requirements_dev.txt
	pip install -e ../types_dsl
	pip install -e .

Run tests

	python -m pytest tests


Try interactively (after installation):

	cd tests/models
	types_dsl_validate *.type
	data_dsl_validate *.data

Expected output:

	validating types.type
	validating types_with_error.type
	  WARNING/ERROR: types_with_error.type:1:1: error: types must be lowercase
	validating data_structures.data


