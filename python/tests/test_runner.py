import queue
from concurrent import futures

import grpc

from codearena_sdk import BaseBot, BotRunner, BotRunnerError
from codearena_sdk.generated.v1 import bot_api_pb2 as pb
from codearena_sdk.generated.v1 import bot_api_pb2_grpc


class RecordingBot(BaseBot):
    def __init__(self):
        super().__init__()
        self.ticks = []
        self.events = []

    def run(self, state):
        self.ticks.append(state.tick)
        self.ahead(state.tick * 5)
        if state.tick == 1:
            self.fire(1.5)

    def on_hit_robot(self, other_id):
        self.events.append(("hit_robot", other_id))


class FakeBotService(bot_api_pb2_grpc.BotServiceServicer):
    def __init__(self):
        self.handshakes = queue.Queue()
        self.intents = queue.Queue()

    def Connect(self, request_iterator, context):
        self.handshakes.put(next(request_iterator))
        for tick in (1, 2):
            yield pb.WorldState(
                tick=tick,
                status=pb.RUNNING,
                bots=[pb.BotState(id="bot-1", name="Alpha")],
                events=[
                    pb.SimulationEvent(
                        tick=tick,
                        hit_robot=pb.HitRobotEvent(bot_id="bot-1", other_id="bot-2"),
                    )
                ],
            )
            self.intents.put(next(request_iterator))


def test_bidirectional_stream_serializes_and_resets_intents():
    service = FakeBotService()
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=2))
    bot_api_pb2_grpc.add_BotServiceServicer_to_server(service, server)
    port = server.add_insecure_port("127.0.0.1:0")
    server.start()
    try:
        bot = RecordingBot()
        BotRunner(bot, bot_id="bot-1").run(
            f"127.0.0.1:{port}", retry_limit=1, timeout=5
        )
    finally:
        server.stop(0)

    assert service.handshakes.get(timeout=1) == pb.BotIntent()
    first = service.intents.get(timeout=1)
    second = service.intents.get(timeout=1)
    assert first.move_distance == 5
    assert first.fire_power == 1.5
    assert second.move_distance == 10
    assert second.fire_power == 0  # transient fire intent was reset
    assert bot.ticks == [1, 2]
    assert bot.events == [("hit_robot", "bot-2"), ("hit_robot", "bot-2")]
    assert bot.id == "bot-1"


def test_ambiguous_bot_selection_raises_instead_of_guessing():
    runner = BotRunner(RecordingBot())
    world = pb.WorldState(bots=[pb.BotState(id="a"), pb.BotState(id="b")])
    try:
        runner._select_bot(world)
    except BotRunnerError:
        pass
    else:
        raise AssertionError("ambiguous bots should not be guessed")


def test_stop_prevents_run():
    runner = BotRunner(RecordingBot())
    runner.stop()
    runner.run("unused:50051", retry_limit=1)
