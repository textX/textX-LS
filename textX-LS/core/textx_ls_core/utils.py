import subprocess  # nosec
from os.path import basename, splitext


def get_file_extension(uri):
    """Returns file extension (without dot) or file name."""
    try:
        ext = splitext(uri)[1]
        return ext[1:] if ext else basename(uri)
    except (AttributeError, IndexError, TypeError):
        return ''


def run(command, **kwargs):
    """Runs a command and returns the output."""
    options = dict(
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        check=True,
        universal_newlines=True
    )
    result = subprocess.run(command, **dict(options, **kwargs))  # nosec
    return result.stdout.rstrip() if result.returncode == 0 else None
