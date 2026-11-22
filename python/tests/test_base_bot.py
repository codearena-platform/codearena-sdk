import pytest

from codearena_sdk import BaseBot
from codearena_sdk.generated.v1 import bot_api_pb2 as pb


class Recorder(BaseBot):
    def run(self, state):
        pass


def test_intent_is_serialized_from_proto_and_reset():
    bot = Recorder()
    bot.ahead(10)
    bot.turn(-15)
    bot.turn_gun(30)
    bot.turn_radar(45)
    bot.fire(9)
    bot.activate_power(pb.SHIELD)

    intent = bot._get_intent_and_reset()
    assert isinstance(intent, pb.BotIntent)
    assert intent.move_distance == 10
    assert intent.turn_degrees == -15
    assert intent.gun_turn_degrees == 30
    assert intent.radar_turn_degrees == 45
    assert intent.fire_power == 3.0
    assert intent.use_power == pb.SHIELD

    # No intent may leak into the next tick.
    next_intent = bot._get_intent_and_reset()
    assert next_intent == pb.BotIntent()


def test_fire_clamps_and_zero_disables_fire():
    bot = Recorder()
    bot.fire(0)
    assert bot._get_intent_and_reset().fire_power == 0
    bot.fire(-1)
    assert bot._get_intent_and_reset().fire_power == 0
    bot.fire(0.05)
    assert bot._get_intent_and_reset().fire_power == pytest.approx(0.1)


def test_activate_power_rejects_unknown_values():
    bot = Recorder()
    try:
        bot.activate_power(99)
    except ValueError:
        pass
    else:
        raise AssertionError("unknown power type was accepted")
