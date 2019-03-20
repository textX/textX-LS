import argparse


def validate():
    parser = argparse.ArgumentParser(description='validate data_dsl files.')
    parser.add_argument('model_files', metavar='model_files', type=str,
                        nargs='+',
                        help='model filenames')
    args = parser.parse_args()

    for filename in args.model_files:
        try:
            print('validating {}'.format(filename))
            from textx.scoping import MetaModelProvider
            mm = MetaModelProvider.get_metamodel(None, filename)
            mm.model_from_file(filename)
        except BaseException as e:
            print('  WARNING/ERROR: {}'.format(e))
