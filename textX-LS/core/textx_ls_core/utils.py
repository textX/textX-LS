import asyncio
from os.path import basename, splitext


def get_file_extension(uri):
    """Returns file extension (without dot) or file name."""
    try:
        ext = splitext(uri)[1]
        return ext[1:] if ext else basename(uri)
    except (AttributeError, IndexError, TypeError):
        return ''


async def run_proc_async(cmd, msg_handler=None, on_exit=None, cwd=None):
    process = await asyncio.create_subprocess_exec(
        *cmd,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.STDOUT,
        cwd=cwd
    )

    if msg_handler:
        async def _listener(process, msg_handler, on_exit):
            while not process.stdout.at_eof():
                line = await process.stdout.readline()
                msg_handler(line)
            if on_exit:
                on_exit()

        asyncio.ensure_future(_listener(process, msg_handler, on_exit))
