"""WebSocket relay server.

Protocol (every message is JSON, unknown fields are rejected):
  registration (first message): {"type": "register", "id": "player-1"}
  broadcast to everyone else:   {"data": ...}
  targeted:                     {"to": "player-2", "data": ...}

Recipients see: {"type": "message", "from": "player-1", "data": ...}
Server errors:  {"type": "error", "error": "...", ...}
On disconnect everyone else gets: {"type": "disconnected", "id": "player-1"}
"""

import argparse
import asyncio
import json
import logging
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field, ValidationError
from websockets.asyncio.server import ServerConnection, serve
from websockets.exceptions import ConnectionClosed

logger = logging.getLogger("relay")

clients: dict[str, ServerConnection] = {}


class RegisterMessage(BaseModel):
    model_config = ConfigDict(extra="forbid")

    type: Literal["register"]
    id: str = Field(min_length=1)


class RelayMessage(BaseModel):
    model_config = ConfigDict(extra="forbid")

    to: str | None = None
    data: Any


def format_error(e: ValidationError) -> dict:
    detail = [
        {"field": ".".join(map(str, err["loc"])), "message": err["msg"]}
        for err in e.errors()
    ]
    return {"type": "error", "error": "invalid_format", "detail": detail}


async def send_json(ws: ServerConnection, payload: dict) -> None:
    try:
        await ws.send(json.dumps(payload, ensure_ascii=False))
    except ConnectionClosed:
        pass


async def register(ws: ServerConnection) -> str | None:
    """Wait for the registration message. Return the user id, or None if registration failed."""
    try:
        message = RegisterMessage.model_validate_json(await ws.recv())
    except ValidationError as e:
        logger.debug("registration from %s rejected: invalid format", ws.remote_address)
        await send_json(ws, format_error(e))
        return None

    if message.id in clients:
        logger.debug("registration from %s rejected: id %r taken", ws.remote_address, message.id)
        logger.info("total players: %d", len(clients))
        await send_json(ws, {"type": "error", "error": "id_taken", "id": message.id})
        return None

    clients[message.id] = ws
    await send_json(ws, {"type": "registered", "id": message.id})
    return message.id


async def handle_message(ws: ServerConnection, user_id: str, raw: str | bytes) -> None:
    try:
        message = RelayMessage.model_validate_json(raw)
    except ValidationError as e:
        logger.debug("invalid message from %s rejected", user_id)
        await send_json(ws, format_error(e))
        return

    outgoing = {"type": "message", "from": user_id, "data": message.data}

    if message.to is None:
        recipients = [other_ws for other_ws in clients.values() if other_ws is not ws]
        logger.debug("%s -> all (%d recipients)", user_id, len(recipients))
        for other_ws in recipients:
            await send_json(other_ws, outgoing)
    else:
        target_ws = clients.get(message.to)
        if target_ws is None:
            logger.debug("%s -> %s: unknown recipient", user_id, message.to)
            await send_json(ws, {"type": "error", "error": "unknown_recipient", "to": message.to})
        else:
            logger.debug("%s -> %s", user_id, message.to)
            await send_json(target_ws, outgoing)


async def handler(ws: ServerConnection) -> None:
    user_id = None
    logger.debug("connection opened from %s", ws.remote_address)
    try:
        user_id = await register(ws)
        if user_id is None:
            return
        logger.debug("+ %s connected (total: %d)", user_id, len(clients))

        async for raw in ws:
            await handle_message(ws, user_id, raw)
    except ConnectionClosed:
        pass
    finally:
        if user_id is not None and clients.get(user_id) is ws:
            del clients[user_id]
            logger.debug("- %s disconnected (total: %d)", user_id, len(clients))
            for other_ws in clients.values():
                await send_json(other_ws, {"type": "disconnected", "id": user_id})


async def run(host: str, port: int) -> None:
    async with serve(handler, host, port) as server:
        logger.info("WebSocket server listening on ws://%s:%d", host, port)
        await server.serve_forever()


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="WebSocket relay server")
    parser.add_argument("--host", required=True, help="host to bind, e.g. 0.0.0.0")
    parser.add_argument("--port", required=True, type=int, help="port to bind, e.g. 8765")
    parser.add_argument(
        "--debug",
        action="store_true",
        help="log every event (connections, registrations, message relay) to the console",
    )
    return parser.parse_args(argv)


def setup_logging(debug: bool) -> None:
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
    # The websockets library logs every connection at INFO and protocol frames at DEBUG;
    # keep it to warnings so the console only shows this server's own events.
    logging.getLogger("websockets").setLevel(logging.WARNING)
    if debug:
        logger.setLevel(logging.DEBUG)


if __name__ == "__main__":
    args = parse_args()
    setup_logging(args.debug)
    asyncio.run(run(args.host, args.port))
