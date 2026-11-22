# CodeArena TypeScript SDK

```ts
import { BaseBot, BotRunner, MatchState } from '@codearena/sdk';

class MyBot extends BaseBot {
  run(state: MatchState): void {
    this.ahead(5);
    this.turnGun(20);
    if ((state.me.energy ?? 0) > 10) this.fire(1.5);
  }
}

await new BotRunner(new MyBot(), { botId: 'bot-1' }).connect('localhost:50051');
```

`BotRunner` uses the `BotService.Connect` bidirectional stream generated from
the vendored `proto/v1/bot_api.proto` (verbatim copy of core's
`api/proto/v1/bot_api.proto`). It sends an empty handshake, dispatches each
`SimulationEvent` oneof to the matching handler, calls `run()` once per world
state, then serializes and resets the pending intent.

- All public state/intent types are aliases of `proto-loader-gen-types` output;
  there is no separate `Vector2`/hand-maintained world model.
- Pass `botId` for multi-bot snapshots. Ambiguous snapshots throw instead of
  silently guessing a bot.
- Pass `credentials: grpc.credentials.createSsl(...)` for TLS. The default
  insecure channel is for local development only.
- `stop()` cancels the stream and resolves `connect()`; connection failures are
  retried with capped exponential backoff.

## Development

```bash
npm ci
npm run generate   # regenerate src/generated from proto/v1/bot_api.proto
npm run build
npm run typecheck
npm test
npm pack --dry-run
```

Publishing is configured for semver releases: `npm publish --provenance` runs
from a `ts-v*` tag workflow after build and tests pass.
