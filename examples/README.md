# Multi-metamodel examples (textX)

## Setup the virtual environment

	virtualenv venv -p $(which python3)
	source ./venv/bin/activate
	pip install -r requirements_dev.txt
	pip install -e multimetamodel01_shared_grammar/
	pip install -e multimetamodel02_separate_packages/types_dsl/
	pip install -e multimetamodel02_separate_packages/data_dsl/
	pip install -e multimetamodel02_separate_packages/flow_dsl/

## Run the tests 

	py.test multimetamodel01_shared_grammar/tests/
	py.test multimetamodel02_separate_packages/types_dsl/
	py.test multimetamodel02_separate_packages/data_dsl/
	py.test multimetamodel02_separate_packages/flow_dsl/

## Run the executables



