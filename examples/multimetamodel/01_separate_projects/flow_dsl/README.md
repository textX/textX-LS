# flow dsl

Prepare:

	virtualenv venv -p $(which python3)
	source ./venv/bin/activate
	pip install -r requirements_dev.txt
	pip install -e ../types_dsl
	pip install -e ../data_dsl
	pip install -e .

Run tests

	python -m pytest tests


Try interactively (after installation):

	cd tests/models
	types_dsl_validate *.type
	data_dsl_validate *.data
	flow_dsl_validate *.flow

Expected output:

	(see parent README.md)
