import logging
import time
import sys
from typing import Optional
import grpc
from .base_bot import BaseBot

# Configure logging for the SDK
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] CodeArena-SDK: %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger("codearena_sdk")

class BotRunner:
    """
    Orchestrates the connection between a Python Bot and the CodeArena Engine.
    Handles gRPC streaming and automatic reconnections.
    """
    def __init__(self, bot: BaseBot):
        self.bot = bot
        self.channel: Optional[grpc.Channel] = None
        self._is_running = False

    def run(self, engine_addr: str = "localhost:50051", retry_limit: int = 5):
        """
        Starts the bot loop.
        :param engine_addr: Address of the Go Simulation Engine.
        :param retry_limit: Max number of connection retries.
        """
        self._is_running = True
        retries = 0
        
        logger.info(f"Initializing Bot Runner for {getattr(self.bot, 'name', 'Unknown Bot')}")
        
        while self._is_running and retries < retry_limit:
            try:
                logger.info(f"Attempting connection to {engine_addr} (Attempt {retries + 1}/{retry_limit})...")
                
                # In a real implementation, we would use the generated stubs:
                # with grpc.insecure_channel(engine_addr) as channel:
                #     stub = pb_grpc.BotServiceStub(channel)
                #     responses = stub.ConnectBot(self._generate_auth_request())
                #     for state in responses:
                #         intent = self.bot.run(state)
                #         stub.SubmitIntent(intent)
                
                # For now, we simulate the connection and tick loop
                self._simulate_loop()
                
                # If we exit the loop cleanly, we stop retrying
                break
                
            except grpc.RpcError as e:
                logger.error(f"gRPC Communication Error: {e.code()} - {e.details()}")
                retries += 1
                time.sleep(min(2 ** retries, 30)) # Exponential backoff
            except Exception as e:
                logger.error(f"Unexpected error in BotRunner: {str(e)}")
                retries += 1
                time.sleep(2)
        
        if retries >= retry_limit:
            logger.critical("Maximum retry limit reached. Shutting down bot.")
            sys.exit(1)

    def _simulate_loop(self):
        """Mock loop for demonstration purposes."""
        logger.info("Connection established. Entering battle loop.")
        # Simulation of 100 ticks
        for i in range(100):
            if not self._is_running:
                break
            # Mock state
            mock_state = {"tick": i, "bots": [], "bullets": []}
            self.bot.run(mock_state)
            time.sleep(0.016) # ~60 FPS
        logger.info("Battle concluded or connection lost.")

    def stop(self):
        """Gracefully stops the bot runner."""
        logger.info("Stopping Bot Runner...")
        self._is_running = False
