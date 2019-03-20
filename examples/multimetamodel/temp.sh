	pip install -yr requirements_dev.txt               | exit 1 
	pip install -y 01_separate_projects/types_dsl/     | exit 1
	pip install -y 01_separate_projects/data_dsl/      | exit 1
	pip install -y 01_separate_projects/flow_dsl/      | exit 1
	pip install -y 01_separate_projects/flow_codegen/  | exit 1
	pip install -y 02_shared_grammar/                  | exit 1
	pip install -y 03_non_textx_models/                | exit 1
	py.test 01_separate_projects/types_dsl/tests       | exit 1
	py.test 01_separate_projects/data_dsl/tests        | exit 1
	py.test 01_separate_projects/flow_dsl/tests        | exit 1
	py.test 01_separate_projects/flow_codegen/tests    | exit 1
	py.test 02_shared_grammar/tests/                   | exit 1
	py.test 03_non_textx_models/tests                  | exit 1
