import argparse
from types_dsl import get_metamodel_types


def validate():
    mm = get_metamodel_types()
    parser = argparse.ArgumentParser(description='validate types_dsl files.')
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
