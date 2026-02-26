from .base_bot import BaseBot

class PythonBot(BaseBot):
    def run(self, state):
        self.ahead(10)
        self.turn(5)
        self.fire(1.0)

    def on_scanned_robot(self, event):
        print(f"Python Bot scanned target!")
        self.fire(3.0)
