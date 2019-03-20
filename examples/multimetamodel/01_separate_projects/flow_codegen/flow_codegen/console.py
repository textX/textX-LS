import argparse
import flow_codegen
from flow_dsl import get_metamodel_flow


def codegen():
    parser = argparse.ArgumentParser(description='validate types_dsl files.')
    parser.add_argument('model_files', metavar='model_files', type=str,
                        nargs='+',
                        help='model filenames')
    args = parser.parse_args()

    for filename in args.model_files:
        try:
            mm = get_metamodel_flow()
            m = mm.model_from_file(filename)
            print('transforming {}'.format(filename))
            txt = flow_codegen.codegen(m)
            with open(filename+".pu", "w") as f:
                f.write(txt)
        except BaseException as e:
            print('  WARNING/ERROR: {}'.format(e))
