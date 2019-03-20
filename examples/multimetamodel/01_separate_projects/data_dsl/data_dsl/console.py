import argparse
from data_dsl import get_metamodel_data


def validate():
    mm = get_metamodel_data()
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
