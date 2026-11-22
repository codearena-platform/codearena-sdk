import * as grpc from '@grpc/grpc-js';

import { BaseBot } from '../src/BaseBot';
import { BotRunner, loadProto, selectBot } from '../src/BotRunner';
import { MatchState, MatchStatus } from '../src/types';

class RecordingBot extends BaseBot {
  public ticks: number[] = [];
  public events: string[] = [];

  public run(state: MatchState): void {
    this.ticks.push(Number(state.tick));
    this.ahead(Number(state.tick) * 5);
    if (Number(state.tick) === 1) this.fire(1.5);
  }

  public onHitRobot(otherId: string): void {
    this.events.push(`hit_robot:${otherId}`);
  }
}

const world = (tick: number) => ({
  tick,
  status: MatchStatus.RUNNING,
  bots: [{ id: 'bot-1', name: 'Alpha' }],
  events: [
    {
      tick,
      hitRobot: { botId: 'bot-1', otherId: 'bot-2' },
    },
  ],
});

describe('BotRunner', () => {
  it('streams handshake and per-tick intents, dispatching events', async () => {
    const proto = loadProto();
    const received: any[] = [];
    const server = new grpc.Server();
    server.addService(proto.codearena.v1.BotService.service, {
      Connect: (call: grpc.ServerDuplexStream<any, any>) => {
        call.on('data', (intent: any) => {
          received.push(intent);
          if (received.length === 1) call.write(world(1));
          else if (received.length === 2) call.write(world(2));
          else call.end();
        });
        call.on('end', () => call.end());
      },
    });
    const port = await new Promise<number>((resolve, reject) => {
      server.bindAsync(
        '127.0.0.1:0',
        grpc.ServerCredentials.createInsecure(),
        (error, boundPort) => (error ? reject(error) : resolve(boundPort)),
      );
    });
    const bot = new RecordingBot();
    try {
      await new BotRunner(bot, { botId: 'bot-1', retryLimit: 1 }).connect(
        `127.0.0.1:${port}`,
      );
    } finally {
      server.forceShutdown();
    }

    expect(received).toHaveLength(3);
    expect(received[0]).toEqual({});
    expect(received[1].moveDistance).toBe(5);
    expect(received[1].firePower).toBeCloseTo(1.5);
    expect(received[2].moveDistance).toBe(10);
    expect(received[2].firePower).toBe(0);
    expect(bot.ticks).toEqual([1, 2]);
    expect(bot.events).toEqual(['hit_robot:bot-2', 'hit_robot:bot-2']);
    expect(bot.id).toBe('bot-1');
  });

  it('does not guess a bot from ambiguous snapshots', () => {
    expect(() => selectBot({ bots: [{ id: 'a' }, { id: 'b' }] })).toThrow(
      /cannot select bot/,
    );
    expect(() => selectBot({ bots: [{ id: 'a' }] }, 'b')).toThrow(/configured bot/);
  });
});
