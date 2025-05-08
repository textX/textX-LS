import os
import sys
import argparse
import logging
from platformdirs import user_log_dir

from .server import TextXLanguageServer

log_dir = user_log_dir("textX")
os.makedirs(log_dir, exist_ok=True)

log_path = os.path.join(log_dir, "textx_ls_server.log")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s: %(message)s",
    handlers=[logging.FileHandler(log_path), logging.StreamHandler()],
)

logger = logging.getLogger(__name__)


def add_arguments(parser):
    parser.description = "textX-LS"

    parser.add_argument("--tcp", action="store_true", help="Use TCP server")
    parser.add_argument("--ws", action="store_true", help="Use WS server")
    parser.add_argument("--stdio", action="store_true", help="Use STDIO")
    parser.add_argument("--pyodide", action="store_true", help="Use pyodide")
    parser.add_argument("--host", default="127.0.0.1", help="Bind to this address")
    parser.add_argument("--port", type=int, default=8080, help="Bind to this port")
    parser.add_argument(
        "--restart-on-close", action="store_true", help="Restart on client close"
    )


def main():
    parser = argparse.ArgumentParser()
    add_arguments(parser)
    args = parser.parse_args()

    if not args.stdio:
        logger.info("LSP Server Python: %s", sys.executable)

    while True:
        if args.tcp:
            TextXLanguageServer().start_tcp(args.host, args.port)
        elif args.ws:
            logger.info("Starting WebSocket server on %s:%s", args.host, args.port)
            TextXLanguageServer().start_ws(args.host, args.port)
        elif args.pyodide:
            logger.info("Starting Pyodide server")
            TextXLanguageServer().start_pyodide()
        elif args.stdio:
            TextXLanguageServer().start_io()
        else:
            logger.error("You must provide transport type.")
            break

        if not args.restart_on_close:
            logger.info("Stopping server.")
            break

        if not args.stdio:
            logger.info("Restarting server.")


if __name__ == "__main__":
    main()
