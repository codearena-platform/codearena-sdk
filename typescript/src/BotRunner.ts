import * as grpc from '@grpc/grpc-js';
import * as path from 'path';
import * as protoLoader from '@grpc/proto-loader';

import { BaseBot } from './BaseBot';
import type {
  BotIntent,
  BotState,
  MatchState,
  ProtoGrpcType,
  SimulationEvent,
  WorldState,
} from './types';

const PROTO_RELATIVE_PATH = path.join('proto', 'v1', 'bot_api.proto');

/** Load the vendored proto with the same options used by generated types. */
export function loadProto(
  protoPath: string = path.resolve(__dirname, '..', PROTO_RELATIVE_PATH),
): ProtoGrpcType {
  const definition = protoLoader.loadSync(protoPath, {
    keepCase: false,
    longs: Number,
    enums: Number,
    defaults: false,
    oneofs: true,
    includeDirs: [path.dirname(protoPath)],
  });
  return grpc.loadPackageDefinition(definition) as unknown as ProtoGrpcType;
}

export interface BotRunnerOptions {
  /** Required when a world snapshot contains more than one bot. */
  botId?: string;
  /** Use grpc.credentials.createSsl(...) for TLS; default is insecure (local dev). */
  credentials?: grpc.ChannelCredentials;
  metadata?: grpc.Metadata;
  callOptions?: grpc.CallOptions;
  /** Connection attempts per connect() call, with capped exponential backoff. */
  retryLimit?: number;
  protoPath?: string;
}

/** Select the bot this runner controls. Never guesses the last entry. */
export function selectBot(world: WorldState, botId?: string): BotState | undefined {
  const bots = world.bots ?? [];
  if (botId) {
    const found = bots.find((bot) => bot.id === botId);
    if (!found) {
      throw new Error(`configured bot ${botId} is not in the world snapshot`);
    }
    return found;
  }
  if (bots.length === 0) return undefined;
  if (bots.length === 1) return bots[0];
  throw new Error(`cannot select bot from ${bots.length} bots: pass botId`);
}

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/** Drives a BaseBot from the BotService.Connect bidirectional stream. */
export class BotRunner {
  private readonly bot: BaseBot;
  private readonly options: BotRunnerOptions;
  private stream?: grpc.ClientDuplexStream<BotIntent, WorldState>;
  private stopped = false;

  constructor(bot: BaseBot, options: BotRunnerOptions = {}) {
    this.bot = bot;
    this.options = options;
  }

  /** Connect and run until the stream ends, an error occurs, or stop() is called. */
  public async connect(engineAddr: string): Promise<void> {
    if (this.stopped) {
      throw new Error('BotRunner has been stopped');
    }
    const retryLimit = this.options.retryLimit ?? 3;
    if (retryLimit < 1) {
      throw new RangeError('retryLimit must be at least 1');
    }

    let lastError: unknown;
    for (let attempt = 1; attempt <= retryLimit; attempt += 1) {
      if (this.stopped) return;
      try {
        await this.connectOnce(engineAddr);
        return;
      } catch (error) {
        if (this.stopped) return;
        lastError = error;
        if (attempt === retryLimit) throw error;
        await delay(Math.min(2 ** (attempt - 1) * 1000, 30_000));
      }
    }
    throw lastError;
  }

  /** Cancel the active stream. Safe to call before connect() or more than once. */
  public stop(): void {
    this.stopped = true;
    if (this.stream) {
      this.stream.cancel();
      this.stream = undefined;
    }
  }

  private connectOnce(engineAddr: string): Promise<void> {
    const proto = loadProto(this.options.protoPath);
    const client = new proto.codearena.v1.BotService(
      engineAddr,
      this.options.credentials ?? grpc.credentials.createInsecure(),
    );
    const stream = client.Connect(
      this.options.metadata ?? new grpc.Metadata(),
      this.options.callOptions ?? {},
    );
    this.stream = stream;

    return new Promise<void>((resolve, reject) => {
      let settled = false;
      const finish = (error?: Error): void => {
        if (settled) return;
        settled = true;
        if (this.stream === stream) this.stream = undefined;
        if (error) reject(error);
        else resolve();
      };
      const fail = (error: unknown): void => {
        if (this.stopped) finish();
        else finish(error instanceof Error ? error : new Error(String(error)));
      };

      stream.on('data', (world: WorldState) => {
        try {
          const intent = this.handleWorld(world);
          if (intent && !this.stopped) {
            stream.write(intent, (error?: Error | null) => {
              if (error) fail(error);
            });
          }
        } catch (error) {
          fail(error);
          stream.cancel();
        }
      });
      stream.on('error', (error: Error) => fail(error));
      stream.on('end', () => finish());

      // The engine registers the bot on the first received intent.
      stream.write({}, (error?: Error | null) => {
        if (error) fail(error);
      });
    });
  }

  private handleWorld(world: WorldState): BotIntent | undefined {
    const me = selectBot(world, this.options.botId);
    if (!me) return undefined;
    if (!this.bot.id && me.id) this.bot.id = me.id;
    this.dispatchEvents(world.events ?? []);
    this.bot.run({ ...world, me } as MatchState);
    return this.bot._getIntentAndReset();
  }

  private dispatchEvents(events: SimulationEvent[]): void {
    for (const event of events) {
      switch (event.event) {
        case 'hitByBullet':
          if (event.hitByBullet) this.bot.onHitByBullet(event.hitByBullet);
          break;
        case 'bulletHitTarget':
          if (event.bulletHitTarget) this.bot.onBulletHitTarget(event.bulletHitTarget);
          break;
        case 'hitWall':
          this.bot.onHitWall();
          break;
        case 'hitRobot':
          this.bot.onHitRobot(event.hitRobot?.otherId ?? '');
          break;
        case 'zoneEntered':
          if (event.zoneEntered) this.bot.onZoneEntered(event.zoneEntered);
          break;
        case 'death':
          this.bot.onDeath();
          break;
        case 'matchFinished':
          if (event.matchFinished) this.bot.onMatchFinished(event.matchFinished);
          break;
      }
    }
  }
}
