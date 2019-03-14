# Example types_dsl

In a virtualenv, install the package

	virtualenv venv -p $(which python3)
	source ./venv/bin/activate
	pip install -r requirements_dev.txt
	pip install -e .


Or run tests:

	python -m pytest tests

Or check coding guidelines

	flake8
