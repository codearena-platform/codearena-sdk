from abc import ABC, abstractmethod

class BaseBot(ABC):
    def __init__(self):
        self.id = ""
        self.name = ""
        self._current_intent = {
            "move_distance": 0.0,
            "turn_degrees": 0.0,
            "gun_turn_degrees": 0.0,
            "radar_turn_degrees": 0.0,
            "fire_power": 0.0,
            "use_power": 0 # POWER_NONE
        }

    @abstractmethod
    def run(self, state):
        """Called every tick."""
        pass

    def ahead(self, distance):
        self._current_intent["move_distance"] = distance

    def back(self, distance):
        self._current_intent["move_distance"] = -distance

    def turn(self, degrees):
        self._current_intent["turn_degrees"] = degrees

    def turn_gun(self, degrees):
        self._current_intent["gun_turn_degrees"] = degrees

    def turn_radar(self, degrees):
        self._current_intent["radar_turn_degrees"] = degrees

    def fire(self, power):
        self._current_intent["fire_power"] = max(0.1, min(3.0, power))

    def activate_power(self, power_type):
        self._current_intent["use_power"] = power_type

    # Event Handlers
    def on_scanned_robot(self, event): pass
    def on_hit_wall(self): pass
    def on_hit_robot(self, other_id): pass
    def on_death(self): pass
