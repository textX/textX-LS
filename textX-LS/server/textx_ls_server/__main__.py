import argparse
import logging

from .server import textx_server

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


def main():
    parser = argparse.ArgumentParser()
    add_arguments(parser)
    args = parser.parse_args()

    if args.tcp:
        textx_server.start_tcp(args.host, args.port)
    elif args.ws:
        print (f"Starting WebSocket server on {args.host}:{args.port}")
        textx_server.start_ws(args.host, args.port)
    elif args.pyodide:
        print (f"Starting Pyodide server")
        textx_server.start_pyodide()
    else:
        textx_server.start_io()


if __name__ == "__main__":
    main()
