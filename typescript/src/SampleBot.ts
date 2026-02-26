import { BaseBot } from './BaseBot';
import { MatchState } from './types';

/**
 * Advanced Sample Bot: Voyager
 * Demonstrates radar scanning and periodic firing.
 */
export class Voyager extends BaseBot {
    public run(state: MatchState): void {
        const me = state.me;

        // Constant movement
        this.ahead(5);
        this.turn(2);

        // Spin radar and gun to find targets
        this.turnGun(20);

        // Simple logic: if we have energy, we fire occasionally
        if (me.energy > 10 && me.heat === 0) {
            this.fire(1.5);
        }
    }

    public onScannedRobot(event: any): void {
        console.log(`Voyager scanned: ${event.name} at distance ${event.distance}`);
        // Lock gun on target
        this.turnGun(event.bearing);
        this.fire(3);
    }

    public onHitWall(): void {
        console.log("Voyager: Ow! Hit a wall, backing up.");
        this.back(50);
        this.turn(45);
    }
}
