from os.path import basename, splitext


def get_file_extension(uri):
    """Returns file extension (without dot) or file name."""
    ext = splitext(uri)[1]
    return ext[1:] if ext else basename(uri)
