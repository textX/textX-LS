import sys
import argparse
import logging

from .server import TextXLanguageServer

logging.basicConfig(filename="textX.log", level=logging.DEBUG, filemode="w")


def add_arguments(parser):
    parser.description = "textX-LS"

    parser.add_argument(
        "--tcp", action="store_true", help="Use TCP server instead of stdio"
    )
    parser.add_argument(
        "--ws", action="store_true", help="Use WS server instead of stdio"
    )
    parser.add_argument(
        "--pyodide", action="store_true", help="Use pyodide instead of stdio"
    )
    parser.add_argument("--host", default="127.0.0.1", help="Bind to this address")
    parser.add_argument("--port", type=int, default=8080, help="Bind to this port")
    parser.add_argument(
        "--restart-on-close", action="store_true", help="Restart on client close"
    )


def main():
    parser = argparse.ArgumentParser()
    add_arguments(parser)
    args = parser.parse_args()

    print(f"LSP Server Python: {sys.executable}")

    while True:
        if args.tcp:
            TextXLanguageServer().start_tcp(args.host, args.port)
        elif args.ws:
            print(f"Starting WebSocket server on {args.host}:{args.port}")
            TextXLanguageServer().start_ws(args.host, args.port)
        elif args.pyodide:
            print("Starting Pyodide server")
            TextXLanguageServer().start_pyodide()
        else:
            print("Starting IO server")
            TextXLanguageServer().start_io()

        if not args.restart_on_close:
            print("Stopping server.")
            break
        print("Restarting server.")


if __name__ == "__main__":
    main()
