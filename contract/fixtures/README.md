# Protobuf contract fixtures

These hex files are golden wire encodings of messages defined in
`codearena-core/api/proto/v1/bot_api.proto` (do not edit by hand):

- `bot_intent.hex`: `BotIntent` with all six fields populated, including
  `use_power = SHIELD`.
- `world_state.hex`: `WorldState` with `status = RUNNING`, a `BotState`
  (`Vector3`, cooldown map, class/team), a `SimulationEvent` oneof
  (`hit_robot`), and `ZoneState`.

They were generated with `Message.SerializeToString(deterministic=True)` using
the SDK's generated stubs. Language SDKs must be able to parse each fixture and
re-serialize the same values to identical bytes. This catches field-number,
type and oneof drift between Python, TypeScript and Go.
