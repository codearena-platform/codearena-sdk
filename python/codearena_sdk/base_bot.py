"""Base class for CodeArena bots.

Intents are accumulated by the action methods and serialized once per tick by
:meth:`BaseBot._get_intent_and_reset`. All transient fields are reset after
serialization so an intent is never replayed on a later tick.
"""

from abc import ABC, abstractmethod
from typing import Any

from codearena_sdk.generated.v1 import bot_api_pb2 as pb


class BaseBot(ABC):
    def __init__(self) -> None:
        self.id = ""
        self.name = ""
        self._current_intent = {
            "move_distance": 0.0,
            "turn_degrees": 0.0,
            "gun_turn_degrees": 0.0,
            "radar_turn_degrees": 0.0,
            "fire_power": 0.0,
            "use_power": pb.POWER_NONE,
        }

    @abstractmethod
    def run(self, state: pb.WorldState) -> None:
        """Called once per tick with the world state received from the engine."""

    def ahead(self, distance: float) -> None:
        self._current_intent["move_distance"] = float(distance)

    def back(self, distance: float) -> None:
        self._current_intent["move_distance"] = -float(distance)

    def turn(self, degrees: float) -> None:
        self._current_intent["turn_degrees"] = float(degrees)

    def turn_gun(self, degrees: float) -> None:
        self._current_intent["gun_turn_degrees"] = float(degrees)

    def turn_radar(self, degrees: float) -> None:
        self._current_intent["radar_turn_degrees"] = float(degrees)

    def fire(self, power: float) -> None:
        """Fire with power 0.1-3.0; non-positive power means no fire."""
        power = float(power)
        if power <= 0:
            self._current_intent["fire_power"] = 0.0
            return
        self._current_intent["fire_power"] = min(3.0, max(0.1, power))

    def activate_power(self, power_type: int) -> None:
        """Activate POWER_NONE, SHIELD, OVERCLOCK or STEALTH."""
        value = int(power_type)
        if value not in (
            pb.POWER_NONE,
            pb.SHIELD,
            pb.OVERCLOCK,
            pb.STEALTH,
        ):
            raise ValueError(f"unknown power type: {power_type!r}")
        self._current_intent["use_power"] = value

    def _get_intent_and_reset(self) -> pb.BotIntent:
        """Serialize the pending intent and clear every transient field."""
        intent = pb.BotIntent(**self._current_intent)
        for field in self._current_intent:
            self._current_intent[field] = 0.0 if field != "use_power" else pb.POWER_NONE
        return intent

    # Event handlers. The runner dispatches oneof events from SimulationEvent;
    # the legacy scanned-robot hook remains available for custom integrations.
    def on_scanned_robot(self, event: Any) -> None:
        pass

    def on_hit_by_bullet(self, event: pb.HitByBulletEvent) -> None:
        pass

    def on_bullet_hit_target(self, event: pb.BulletHitTargetEvent) -> None:
        pass

    def on_hit_wall(self) -> None:
        pass

    def on_hit_robot(self, other_id: str) -> None:
        pass

    def on_zone_entered(self, event: pb.ZoneEnteredEvent) -> None:
        pass

    def on_death(self) -> None:
        pass

    def on_match_finished(self, event: pb.MatchFinishedEvent) -> None:
        pass
