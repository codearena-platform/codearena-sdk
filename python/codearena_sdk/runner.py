"""gRPC runner that drives a :class:`BaseBot` from BotService world states."""

from __future__ import annotations

import logging
import queue
import threading
from typing import Iterator, Optional, Sequence, Tuple

import grpc

from codearena_sdk.generated.v1 import bot_api_pb2 as pb
from codearena_sdk.generated.v1 import bot_api_pb2_grpc

from .base_bot import BaseBot

logger = logging.getLogger(__name__)
logger.addHandler(logging.NullHandler())


class BotRunnerError(RuntimeError):
    """Raised for configuration or bot-code failures in the runner."""


class BotRunner:
    """Connect a bot to the engine over the bidirectional ``BotService`` stream.

    One instance drives one stream. Pass ``credentials=grpc.ssl_channel_credentials()``
    (or a custom ``grpc.ChannelCredentials``) for TLS; the default insecure
    channel is intended for local development only.
    """

    def __init__(
        self,
        bot: BaseBot,
        bot_id: Optional[str] = None,
        credentials: Optional[grpc.ChannelCredentials] = None,
        metadata: Sequence[Tuple[str, str]] = (),
    ) -> None:
        self.bot = bot
        self.bot_id = bot_id or ""
        self.credentials = credentials
        self.metadata = tuple(metadata)
        self._stop = threading.Event()
        self._inbox: queue.Queue[Optional[pb.WorldState]] = queue.Queue()
        self._stream = None
        self._failure: Optional[BaseException] = None

    def run(
        self,
        engine_addr: str = "localhost:50051",
        retry_limit: int = 5,
        timeout: Optional[float] = None,
    ) -> None:
        """Run until the stream closes or :meth:`stop` is called.

        Connection failures are retried with capped exponential backoff. If all
        attempts fail, a ``ConnectionError`` is raised; bot-code errors raise
        ``BotRunnerError``. This method never terminates the process.
        """
        if retry_limit < 1:
            raise ValueError("retry_limit must be at least 1")

        last_error: Optional[grpc.RpcError] = None
        for attempt in range(1, retry_limit + 1):
            if self._stop.is_set():
                return
            try:
                self._run_once(engine_addr, timeout)
                return
            except grpc.RpcError as exc:
                if self._stop.is_set() and exc.code() == grpc.StatusCode.CANCELLED:
                    return
                if self._failure is not None:
                    raise BotRunnerError("bot callback failed") from self._failure
                last_error = exc
                if attempt == retry_limit:
                    break
                delay = min(2 ** (attempt - 1), 30)
                logger.warning(
                    "Connection attempt %d/%d failed (%s); retrying in %ds",
                    attempt,
                    retry_limit,
                    exc.code().name if exc.code() else type(exc).__name__,
                    delay,
                )
                if self._stop.wait(delay):
                    return

        raise ConnectionError(
            f"could not maintain a CodeArena stream to {engine_addr} "
            f"after {retry_limit} attempts"
        ) from last_error

    def stop(self) -> None:
        """Stop the runner; safe to call from another thread or before ``run``."""
        self._stop.set()
        stream = self._stream
        if stream is not None:
            stream.cancel()
        self._inbox.put(None)

    def _run_once(self, engine_addr: str, timeout: Optional[float]) -> None:
        self._failure = None
        self._inbox = queue.Queue()

        factory = (
            grpc.secure_channel(engine_addr, self.credentials)
            if self.credentials is not None
            else grpc.insecure_channel(engine_addr)
        )
        with factory as channel:
            stub = bot_api_pb2_grpc.BotServiceStub(channel)
            responses = stub.Connect(
                self._request_iterator(), metadata=self.metadata, timeout=timeout
            )
            self._stream = responses
            try:
                for world in responses:
                    if self._stop.is_set():
                        break
                    self._inbox.put(world)
            finally:
                self._stream = None
                self._inbox.put(None)
                responses.cancel()

        if self._failure is not None:
            raise BotRunnerError("bot callback failed") from self._failure

    def _request_iterator(self) -> Iterator[pb.BotIntent]:
        # The engine registers the bot when it receives the first intent.
        yield pb.BotIntent()

        while not self._stop.is_set():
            try:
                world = self._inbox.get(timeout=0.1)
            except queue.Empty:
                continue
            if world is None:
                return

            try:
                self._process_world(world)
                yield self.bot._get_intent_and_reset()
            except Exception as exc:  # surface bot bugs instead of retrying blindly
                self._failure = exc
                self.stop()
                return

    def _process_world(self, world: pb.WorldState) -> None:
        me = self._select_bot(world)
        if me is None:
            return
        if not self.bot.id:
            self.bot.id = me.id
        self._dispatch_events(world)
        self.bot.run(world)

    def _select_bot(self, world: pb.WorldState) -> Optional[pb.BotState]:
        bots = list(world.bots)
        if self.bot_id:
            for bot in bots:
                if bot.id == self.bot_id:
                    return bot
            raise BotRunnerError(
                f"configured bot {self.bot_id!r} is not in the world snapshot"
            )
        if not bots:
            return None
        if len(bots) == 1:
            return bots[0]
        raise BotRunnerError(
            f"cannot select bot from {len(bots)} bots; pass bot_id to BotRunner"
        )

    def _dispatch_events(self, world: pb.WorldState) -> None:
        for simulation_event in world.events:
            kind = simulation_event.WhichOneof("event")
            if kind is None:
                continue
            event = getattr(simulation_event, kind)
            if kind == "hit_by_bullet":
                self.bot.on_hit_by_bullet(event)
            elif kind == "bullet_hit_target":
                self.bot.on_bullet_hit_target(event)
            elif kind == "hit_wall":
                self.bot.on_hit_wall()
            elif kind == "hit_robot":
                self.bot.on_hit_robot(event.other_id)
            elif kind == "zone_entered":
                self.bot.on_zone_entered(event)
            elif kind == "death":
                self.bot.on_death()
            elif kind == "match_finished":
                self.bot.on_match_finished(event)
