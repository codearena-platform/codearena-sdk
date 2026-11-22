# CodeArena Python SDK

```python
from codearena_sdk import BaseBot, BotRunner


class MyBot(BaseBot):
    def run(self, state):
        self.ahead(5)
        self.turn(10)
        if state.bots:
            self.fire(1.5)


BotRunner(MyBot(), bot_id="bot-1").run("localhost:50051")
```

`BotRunner` uses the `BotService.Connect` bidirectional stream from the v1
proto. It sends an empty handshake intent, dispatches each `SimulationEvent`
oneof to the matching handler, calls `run()` once per world state, then
serializes and resets the pending intent. Intents never leak into later ticks.

- Pass `bot_id` when a snapshot can contain multiple bots; with a single bot the
  runner selects it deterministically. Ambiguous snapshots raise
  `BotRunnerError` instead of silently guessing.
- Pass `credentials=grpc.ssl_channel_credentials()` for TLS. The default
  insecure channel is for local development only.
- `stop()` cancels the stream from another thread. Library code raises
  exceptions (`ConnectionError`, `BotRunnerError`) and never calls `sys.exit`.

The generated stubs in `codearena_sdk/generated/v1` come from the vendored
`bot_api.proto`, a verbatim copy of `codearena-core/api/proto/v1/bot_api.proto`.
Regenerate and verify them with:

```bash
pip install -e '.[dev]'
python scripts/generate_stubs.py --from-core ../../codearena-core/api/proto/v1/bot_api.proto
python scripts/generate_stubs.py --check
python -m pytest
```
