import asyncio
from os import linesep
from os.path import basename, isdir, isfile, join, splitext
from typing import Callable, Iterable, Optional, Tuple


def compare_project_names(p1: str, p2: str) -> bool:
    """Compares project names replacing `-` with `_`.

    Args:
        p1: project name
        p2: project name to compare to
    Returns:
        True if project names are the same, otherwise False
    Raises:
        None

    """

    def replace(name):
        return name.replace("-", "_").lower()

    return replace(p1) == replace(p2)


def dist_is_editable(dist_location: str, project_name: str) -> bool:
    """Checks if distribution is installed in editable mode.

    Args:
        dist_location: location of python package
        project_name: project name
    Returns:
        True if project is installed in editable mode (with `-e` flag), otherwise False
    Raises:
        None

    """

    def _check_egg(name):
        return isdir(join(dist_location, name + ".egg-info")) or isfile(
            join(dist_location, name + ".egg-link")
        )

    return _check_egg(project_name) or _check_egg(project_name.replace("-", "_"))


def get_file_extension(uri: str) -> str:
    """Returns file extension (without dot) or file name.

    Args:
        uri: file uri
    Returns:
        File extension
    Raises:
        None

    """
    try:
        ext = splitext(uri)[1]
        return ext[1:] if ext else basename(uri)
    except (AttributeError, IndexError, TypeError):
        return ""


def get_project_name_and_version(folder_or_wheel: str) -> Tuple[str, str]:
    """Returns project name for a given project folder (with setup.py)
    or wheel file.

    Args:
        folder_or_wheel: path to the folder or wheel of textx language project
    Returns:
        Project name and version
    Raises:
        None

    """
    project_metadata = {}
    # Folder with setup.py inside (project) ...
    setuppy = join(folder_or_wheel, "setup.py")
    if isfile(setuppy):
        from unittest import mock
        import setuptools

        with mock.patch.object(setuptools, "setup") as mock_setup:
            with open(setuppy, "r") as f:
                exec(f.read())
            project_metadata.update(mock_setup.call_args[1])
    # ... or setup.cfg
    setupcfg = join(folder_or_wheel, "setup.cfg")
    if isfile(setupcfg):
        try:
            from configparser import ConfigParser

            cfg_parser = ConfigParser()
            cfg_parser.read(setupcfg)
            project_metadata.update(dict(cfg_parser.items("metadata")))
        except Exception:
            pass

    # installed from wheel
    if isfile(folder_or_wheel) and folder_or_wheel.endswith(".whl"):
        from wheel_inspect import inspect_wheel

        project_metadata.update(inspect_wheel(folder_or_wheel))
        project_metadata.update({"name": project_metadata.get("project")})

    return project_metadata.get("name", None), project_metadata.get("version", None)


async def run_async(
    cmd: Iterable, msg_handler: Optional[Callable] = None, cwd: Optional[str] = None
) -> int:
    """Runs process using `asyncio.create_subprocess_exec`.

    Args:
        cmd: command to execute
        msg_handler: a callable which is called with message argument when process writes to stdout
        cwd: current working directory
    Returns:
        Return code and output of a process
    Raises:
        None

    """
    process = await asyncio.create_subprocess_exec(
        *cmd, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.STDOUT, cwd=cwd
    )

    output = []

    async def _listener(process, msg_handler):
        while not process.stdout.at_eof():
            line = await process.stdout.readline()
            if line is not None:
                line = line.decode().rstrip()
                output.append(line)
                # Call message handler
                if msg_handler:
                    msg_handler(line)
        return process

    process = await asyncio.ensure_future(_listener(process, msg_handler))

    return process.returncode or 0, linesep.join(output)
