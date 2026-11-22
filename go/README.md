# CodeArena Go SDK

The SDK uses the generated protobuf types from `codearena-core/pkg/api/v1` and
the `BotService.Connect` bidirectional stream.

```go
type MyBot struct{}

func (MyBot) OnTick(me *pb.BotState, world *pb.WorldState) *pb.BotIntent {
    return &pb.BotIntent{
        MoveDistance: 5,
        GunTurnDegrees: 10,
        FirePower: 1.5,
    }
}

func main() {
    kit := sdk.NewBotKit("localhost:50051", MyBot{}).WithBotID("bot-42")
    if err := kit.Run(); err != nil {
        log.Fatal(err)
    }
}
```

`Run()` installs SIGINT/SIGTERM handling. Use `RunContext(ctx)` when the caller
owns cancellation. For TLS, call `WithTLS(nil)` (system roots, TLS 1.2 minimum)
or `WithTLS(&tls.Config{...})` / `WithTransportCredentials(creds)`. The default
is an insecure channel intended for local development only.

The module uses a local `replace` for the sibling `codearena-core` checkout;
CI checks out both repositories side by side.
