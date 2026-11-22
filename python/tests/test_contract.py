"""Cross-language golden-wire checks against the real v1 proto."""

from pathlib import Path

from codearena_sdk.generated.v1 import bot_api_pb2 as pb

FIXTURES = Path(__file__).resolve().parents[2] / "contract" / "fixtures"


def _hex(name):
    return (FIXTURES / name).read_text().strip()


def test_bot_intent_golden_encoding():
    data = bytes.fromhex(_hex("bot_intent.hex"))
    intent = pb.BotIntent.FromString(data)
    assert intent.move_distance == 12.5
    assert intent.turn_degrees == -30
    assert intent.gun_turn_degrees == 15
    assert intent.radar_turn_degrees == 90
    assert intent.fire_power == 2.5
    assert intent.use_power == pb.SHIELD
    assert intent.SerializeToString(deterministic=True) == data


def test_world_state_golden_encoding():
    data = bytes.fromhex(_hex("world_state.hex"))
    world = pb.WorldState.FromString(data)
    assert world.tick == 42
    assert world.status == pb.RUNNING
    assert len(world.bots) == 1
    bot = world.bots[0]
    assert bot.id == "bot-1"
    assert bot.position.x == 1.5
    assert bot.cooldowns == {"SHIELD": 3}
    assert getattr(bot, "class") == "Tank"
    assert world.zone.radius == 400
    assert len(world.events) == 1
    event = world.events[0]
    assert event.WhichOneof("event") == "hit_robot"
    assert event.hit_robot.other_id == "bot-2"
    assert world.SerializeToString(deterministic=True) == data
