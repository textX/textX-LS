import sys
import argparse
import logging

from .server import TextXLanguageServer

logging.basicConfig(filename="textX.log", level=logging.DEBUG, filemode="w")


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
        elif args.stdio:
            TextXLanguageServer().start_io()
        else:
            print("You must provide transport type.")
            break

        if not args.restart_on_close:
            if not args.stdio:
                print("Stopping server.")
            break

        if not args.stdio:
            print("Restarting server.")


if __name__ == "__main__":
    main()
