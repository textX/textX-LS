# Multi-metamodel examples (textX)

## Setup the virtual environment

	virtualenv venv -p $(which python3)
	source ./venv/bin/activate
	pip install -r requirements_dev.txt
	pip install multimetamodel01_shared_grammar/
	pip install multimetamodel02_separate_packages/types_dsl/
	pip install multimetamodel02_separate_packages/data_dsl/
	pip install multimetamodel02_separate_packages/flow_dsl/

## Run the tests 

	py.test multimetamodel01_shared_grammar/tests/
	py.test multimetamodel02_separate_packages/types_dsl/
	py.test multimetamodel02_separate_packages/data_dsl/
	py.test multimetamodel02_separate_packages/flow_dsl/

## Run the executables

Here, you can validate the model used by the tests files interactively.

### flow_dsl, data_dsl, types_dsl

Here, we have three separate validators, one for each DSL (one is used here).

	cd multimetamodel02_separate_packages/flow_dsl/tests/models/
	flow_dsl_validate *.flow

Expected outcome

	validating data_flow.flow
	validating data_flow_including_error.flow
	  WARNING/ERROR: /home/pierre/checkouts/textX-LS/examples/multimetamodel01_shared_grammar/tests/models/types_with_error.type:1:1: error: types must be lowercase
	validating data_flow_with_error.flow
	  WARNING/ERROR: data_flow_with_error.flow:5:1: error: algo data types must match
	
### types_data_flow_dsls

Here, we have one validator for all DSLs (metamodel selected by filename suffix).

	cd multimetamodel01_shared_grammar/tests/models/
	types_data_flow_dsls_validate *.*

Expected outcome

	validating data_flow.flow
	validating data_flow_including_error.flow
	  WARNING/ERROR: /home/pierre/checkouts/textX-LS/examples/multimetamodel01_shared_grammar/tests/models/types_with_error.type:1:1: error: types must be lowercase
	validating data_flow_with_error.flow
	  WARNING/ERROR: data_flow_with_error.flow:5:1: error: algo data types must match
	validating data_structures.data
	validating data_structures_including_error.data
	  WARNING/ERROR: /home/pierre/checkouts/textX-LS/examples/multimetamodel01_shared_grammar/tests/models/types_with_error.type:1:1: error: types must be lowercase
	validating types.type
	validating types_with_error.type
	  WARNING/ERROR: types_with_error.type:1:1: error: types must be lowercase

