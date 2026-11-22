"""Python SDK for CodeArena bots."""

from .base_bot import BaseBot
from .runner import BotRunner, BotRunnerError

__all__ = ["BaseBot", "BotRunner", "BotRunnerError"]
__version__ = "0.1.0"
