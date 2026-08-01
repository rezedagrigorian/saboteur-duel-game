import asyncio
import json
import logging

import pytest
from websockets.asyncio.client import connect
from websockets.asyncio.server import serve

import server


@pytest.fixture
async def url():
    server.clients.clear()
    async with serve(server.handler, "127.0.0.1", 0) as srv:
        port = srv.sockets[0].getsockname()[1]
        yield f"ws://127.0.0.1:{port}"


async def recv_json(ws, timeout=2):
    return json.loads(await asyncio.wait_for(ws.recv(), timeout))


async def expect_silence(ws, timeout=0.2):
    with pytest.raises(TimeoutError):
        await asyncio.wait_for(ws.recv(), timeout)


async def register(ws, user_id):
    await ws.send(json.dumps({"type": "register", "id": user_id}))
    return await recv_json(ws)


async def test_register(url):
    async with connect(url) as ws:
        assert await register(ws, "a") == {"type": "registered", "id": "a"}
        assert "a" in server.clients


async def test_register_missing_id(url):
    async with connect(url) as ws:
        await ws.send(json.dumps({"type": "register"}))
        resp = await recv_json(ws)
        assert resp["error"] == "invalid_format"
        assert resp["detail"][0]["field"] == "id"


async def test_register_extra_field(url):
    async with connect(url) as ws:
        await ws.send(json.dumps({"type": "register", "id": "a", "hack": 1}))
        resp = await recv_json(ws)
        assert resp["error"] == "invalid_format"
        assert resp["detail"][0]["field"] == "hack"


async def test_duplicate_id_rejected(url):
    async with connect(url) as a, connect(url) as dup:
        await register(a, "a")
        resp = await register(dup, "a")
        assert resp["type"] == "error"
        assert resp["error"] == "id_taken"
        assert "a" in server.clients


async def test_broadcast_excludes_sender(url):
    async with connect(url) as a, connect(url) as b, connect(url) as c:
        await register(a, "a")
        await register(b, "b")
        await register(c, "c")

        await a.send(json.dumps({"data": {"hello": "world"}}))
        expected = {"type": "message", "from": "a", "data": {"hello": "world"}}
        assert await recv_json(b) == expected
        assert await recv_json(c) == expected
        await expect_silence(a)


async def test_targeted_message(url):
    async with connect(url) as a, connect(url) as b, connect(url) as c:
        await register(a, "a")
        await register(b, "b")
        await register(c, "c")

        await a.send(json.dumps({"to": "b", "data": "private"}))
        assert await recv_json(b) == {"type": "message", "from": "a", "data": "private"}
        await expect_silence(c)


async def test_unknown_recipient(url):
    async with connect(url) as a:
        await register(a, "a")
        await a.send(json.dumps({"to": "ghost", "data": 1}))
        resp = await recv_json(a)
        assert resp["error"] == "unknown_recipient"
        assert resp["to"] == "ghost"


async def test_invalid_json(url):
    async with connect(url) as a:
        await register(a, "a")
        await a.send("not json")
        resp = await recv_json(a)
        assert resp["error"] == "invalid_format"


async def test_extra_field_rejected(url):
    async with connect(url) as a:
        await register(a, "a")
        await a.send(json.dumps({"data": 1, "extra": True}))
        resp = await recv_json(a)
        assert resp["error"] == "invalid_format"
        assert resp["detail"][0]["field"] == "extra"


async def test_missing_data_rejected(url):
    async with connect(url) as a, connect(url) as b:
        await register(a, "a")
        await register(b, "b")
        await a.send(json.dumps({"to": "b"}))
        resp = await recv_json(a)
        assert resp["error"] == "invalid_format"
        assert resp["detail"][0]["field"] == "data"
        await expect_silence(b)


async def test_id_freed_after_disconnect(url):
    async with connect(url) as a:
        await register(a, "a")
    async with asyncio.timeout(2):
        while "a" in server.clients:
            await asyncio.sleep(0.01)
    async with connect(url) as a2:
        assert await register(a2, "a") == {"type": "registered", "id": "a"}


async def test_disconnect_notifies_others(url):
    async with connect(url) as b, connect(url) as c:
        await register(b, "b")
        await register(c, "c")
        async with connect(url) as a:
            await register(a, "a")
        expected = {"type": "disconnected", "id": "a"}
        assert await recv_json(b) == expected
        assert await recv_json(c) == expected


async def test_debug_logging(url, caplog):
    with caplog.at_level(logging.DEBUG, logger="relay"):
        async with connect(url) as a, connect(url) as b:
            await register(a, "a")
            await register(b, "b")
            await a.send(json.dumps({"to": "b", "data": 1}))
            await recv_json(b)
            await a.send(json.dumps({"data": 2}))
            await recv_json(b)
    text = caplog.text
    assert "+ a connected" in text
    assert "+ b connected" in text
    assert "a -> b" in text
    assert "a -> all (1 recipients)" in text


def test_cli_args_parsed():
    args = server.parse_args(["--host", "127.0.0.1", "--port", "8765"])
    assert args.host == "127.0.0.1"
    assert args.port == 8765
    assert args.debug is False


def test_cli_debug_flag():
    args = server.parse_args(["--host", "127.0.0.1", "--port", "8765", "--debug"])
    assert args.debug is True


def test_cli_requires_host_and_port(capsys):
    with pytest.raises(SystemExit) as exc:
        server.parse_args([])
    assert exc.value.code != 0
    assert "--host" in capsys.readouterr().err
