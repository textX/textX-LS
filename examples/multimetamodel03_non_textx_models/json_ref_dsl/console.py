import argparse
from json_ref_dsl import get_metamodel


def validate():
    mm = get_metamodel()
    parser = argparse.ArgumentParser(description='validate types_dsl files.')
    parser.add_argument('model_files', metavar='model_files', type=str,
                        nargs='+',
                        help='model filenames')
    args = parser.parse_args()

    for filename in args.model_files:
        try:
            print('validating {}'.format(filename))
            m = mm.model_from_file(filename)
            for a in m.access:
                print("{} --> {}: ok".format(a.name, a.pyattr))
        except BaseException as e:
            print('  WARNING/ERROR: {}'.format(e))
