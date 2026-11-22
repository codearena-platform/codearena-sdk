import * as path from 'path';

import protobuf from 'protobufjs';

const ROOT = path.resolve(__dirname, '..');
const PROTO = path.join(ROOT, 'proto', 'v1', 'bot_api.proto');
const FIXTURES = path.resolve(ROOT, '..', 'contract', 'fixtures');

const fixture = (name: string): string =>
  path.join(FIXTURES, name).replace(/\\/g, '/');

const hex = (name: string): string =>
  require('fs').readFileSync(path.join(FIXTURES, name), 'utf8').trim();

describe('cross-language protobuf contract', () => {
  it('parses and re-encodes the golden BotIntent bytes', async () => {
    const root = await protobuf.load(PROTO);
    const BotIntent = root.lookupType('codearena.v1.BotIntent');
    const data = Buffer.from(hex('bot_intent.hex'), 'hex');
    const message: any = BotIntent.decode(data);

    expect(message.moveDistance).toBeCloseTo(12.5);
    expect(message.turnDegrees).toBe(-30);
    expect(message.gunTurnDegrees).toBe(15);
    expect(message.radarTurnDegrees).toBe(90);
    expect(message.firePower).toBeCloseTo(2.5);
    expect(message.usePower).toBe(1); // SHIELD
    expect(Buffer.from(BotIntent.encode(message).finish()).toString('hex')).toBe(
      hex('bot_intent.hex'),
    );
  });

  it('parses and re-encodes the golden WorldState bytes', async () => {
    const root = await protobuf.load(PROTO);
    const WorldState = root.lookupType('codearena.v1.WorldState');
    const data = Buffer.from(hex('world_state.hex'), 'hex');
    const message: any = WorldState.decode(data);

    expect(Number(message.tick)).toBe(42);
    expect(message.status).toBe(2); // RUNNING
    expect(message.bots).toHaveLength(1);
    expect(message.bots[0].id).toBe('bot-1');
    expect(message.bots[0].position.x).toBeCloseTo(1.5);
    expect(message.bots[0].cooldowns.SHIELD).toBe(3);
    expect(message.bots[0].class).toBe('Tank');
    expect(message.zone.radius).toBeCloseTo(400);
    expect(message.events).toHaveLength(1);
    expect(message.events[0].hitRobot.otherId).toBe('bot-2');
    expect(Buffer.from(WorldState.encode(message).finish()).toString('hex')).toBe(
      hex('world_state.hex'),
    );
  });
});
