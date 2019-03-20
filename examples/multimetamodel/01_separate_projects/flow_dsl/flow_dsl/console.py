import argparse
from flow_dsl import get_metamodel_flow


def validate():
    mm = get_metamodel_flow()
    parser = argparse.ArgumentParser(description='validate data_dsl files.')
    parser.add_argument('model_files', metavar='model_files', type=str,
                        nargs='+',
                        help='model filenames')
    args = parser.parse_args()

    for filename in args.model_files:
        try:
            print('validating {}'.format(filename))
            mm.model_from_file(filename)
        except BaseException as e:
            print('  WARNING/ERROR: {}'.format(e))
