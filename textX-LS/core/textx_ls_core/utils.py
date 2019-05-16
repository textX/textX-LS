import asyncio
from os.path import basename, splitext


def get_file_extension(uri):
    """Returns file extension (without dot) or file name."""
    try:
        ext = splitext(uri)[1]
        return ext[1:] if ext else basename(uri)
    except (AttributeError, IndexError, TypeError):
        return ''


async def run_proc_async(cmd, msg_handler=None, cwd=None):
    process = await asyncio.create_subprocess_exec(
        *cmd,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.STDOUT,
        cwd=cwd
    )
    await process.communicate()

    if msg_handler:
        async def _listener(process, msg_handler):
            while not process.stdout.at_eof():
                line = await process.stdout.readline()
                if line is not None:
                    msg_handler(line.decode().rstrip())

        asyncio.ensure_future(_listener(process, msg_handler))

    return process.returncode
