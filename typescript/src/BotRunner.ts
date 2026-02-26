import * as grpc from '@grpc/grpc-js';
import { BaseBot } from './BaseBot';
import { MatchState, BotState, Vector2 } from './types';

/**
 * BotRunner handles the gRPC connection to the Simulation Engine
 * and drives the bot's lifecycle.
 */
export class BotRunner {
    private client: any;
    private stream: any;
    private bot: BaseBot;

    constructor(bot: BaseBot) {
        this.bot = bot;
    }

    /**
     * Connect to the simulation engine and start the bot loop.
     * @param engineAddr Address of the simulation engine (e.g., "localhost:50051")
     */
    public async connect(engineAddr: string): Promise<void> {
        console.log(`Connecting to CodeArena Simulation Engine at ${engineAddr}...`);

        // Note: In a real implementation, we would load the .proto here.
        // For v1, we assume the gRPC client is configured or use a simplified stub.

        // Mocking the gRPC stream start for demonstration in this phase
        console.log("Joined match. Starting bot loop...");
        this.startLoop();
    }

    private startLoop() {
        // Simplified loop: in reality, this would be driven by gRPC Recv() events
        // to ensure the bot runs exactly once per world tick.
    }

    /**
     * Dispatches engine events to the bot's handler methods.
     */
    private dispatchEvents(events: any[]) {
        for (const ev of events) {
            switch (ev.type) {
                case 'HIT_WALL':
                    this.bot.onHitWall();
                    break;
                case 'HIT_ROBOT':
                    this.bot.onHitRobot(ev.other_id);
                    break;
                case 'SCANNED_ROBOT':
                    this.bot.onScannedRobot(ev.data);
                    break;
                case 'DEATH':
                    this.bot.onDeath();
                    break;
            }
        }
    }
}
