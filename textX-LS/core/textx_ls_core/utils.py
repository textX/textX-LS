import asyncio
from os.path import basename, isdir, isfile, join, splitext


def compare_project_names(p1, p2):
    """Compare project names replacing `-` and `_` with empty char."""

    def replace(name):
        return name.replace("-", "_").lower()

    return replace(p1) == replace(p2)


def dist_is_editable(dist_location, project_name):
    """Is distribution installed in editable mode."""

    def _check_egg(name):
        return isdir(join(dist_location, name + ".egg-info")) or isfile(
            join(dist_location, name + ".egg-link")
        )

    return _check_egg(project_name) or _check_egg(project_name.replace("-", "_"))


def get_file_extension(uri):
    """Returns file extension (without dot) or file name."""
    try:
        ext = splitext(uri)[1]
        return ext[1:] if ext else basename(uri)
    except (AttributeError, IndexError, TypeError):
        return ""


def get_project_name_and_version(folder_or_wheel):
    """Returns project name for given project folder (with setup.py)
    or wheel file.
    """
    project_name = None
    version = None
    # Folder with setup.py inside (project)
    setuppy = join(folder_or_wheel, "setup.py")
    if isfile(setuppy):
        from unittest import mock
        import setuptools

        with mock.patch.object(setuptools, "setup") as mock_setup:
            with open(setuppy, "r") as f:
                exec(f.read())
            _, kwargs = mock_setup.call_args
        project_name = kwargs.get("name", None)
        version = kwargs.get("version", None)
    elif isfile(folder_or_wheel) and folder_or_wheel.endswith(".whl"):  # wheel file
        from wheel_inspect import inspect_wheel

        project_info = inspect_wheel(folder_or_wheel)
        project_name = project_info.get("project", None)
        version = project_info.get("version", None)

    return project_name, version


async def run_proc_async(cmd, msg_handler=None, cwd=None):
    process = await asyncio.create_subprocess_exec(
        *cmd, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.STDOUT, cwd=cwd
    )

    if msg_handler:

        async def _listener(process, msg_handler):
            while not process.stdout.at_eof():
                line = await process.stdout.readline()
                if line is not None:
                    msg_handler(line.decode().rstrip())
            return process

        process = await asyncio.ensure_future(_listener(process, msg_handler))
    else:
        await process.communicate()

    return process.returncode
