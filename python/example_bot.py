"""Example bot: run with ``python example_bot.py localhost:50051``."""

import logging
import sys

from codearena_sdk import BaseBot, BotRunner


class PythonBot(BaseBot):
    def run(self, state):
        self.ahead(10)
        self.turn(5)
        self.turn_gun(20)
        self.fire(1.0)

    def on_hit_wall(self):
        self.back(50)
        self.turn(45)


def main(address: str = "localhost:50051") -> None:
    logging.basicConfig(level=logging.INFO)
    BotRunner(PythonBot()).run(address)


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "localhost:50051")
