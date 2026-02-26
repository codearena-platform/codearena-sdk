import { BotIntent, MatchState, ScannedRobotEvent } from './types';

/**
 * BaseBot is the class that all robot developers should extend.
 * It provides the high-level API to control the robot and handle events.
 */
export abstract class BaseBot {
    public id: string = "";
    public name: string = "";

    // Internal state tracking
    protected currentIntent: BotIntent = {
        moveDistance: 0,
        turnDegrees: 0,
        gunTurnDegrees: 0,
        radarTurnDegrees: 0,
        firePower: 0,
        usePower: 0, // PowerType.NONE
    };

    /**
     * Called every simulation tick.
     * @param state The current state of the world and the robot.
     */
    public abstract run(state: MatchState): void;

    // --- Action Methods ---

    /**
     * Move the robot forward or backward.
     * @param distance Distance to move (+ forward, - backward).
     */
    public ahead(distance: number): void {
        this.currentIntent.moveDistance = distance;
    }

    public back(distance: number): void {
        this.currentIntent.moveDistance = -distance;
    }

    /**
     * Turn the robot body.
     * @param degrees Rotation in degrees (+ clockwise, - counter-clockwise).
     */
    public turn(degrees: number): void {
        this.currentIntent.turnDegrees = degrees;
    }

    /**
     * Turn the gun independently of the body.
     */
    public turnGun(degrees: number): void {
        this.currentIntent.gunTurnDegrees = degrees;
    }

    /**
     * Fire a bullet with specific power.
     * @param power Power from 0.1 to 3.0.
     */
    public fire(power: number): void {
        this.currentIntent.firePower = Math.max(0, Math.min(3, power));
    }

    /**
     * Activate a special module (Shield, Overclock, etc.)
     */
    public activatePower(power: number): void {
        this.currentIntent.usePower = power;
    }

    /**
     * Turn the radar independently.
     */
    public turnRadar(degrees: number): void {
        this.currentIntent.radarTurnDegrees = degrees;
    }

    // --- Event Handlers (can be overridden) ---

    public onScannedRobot(event: ScannedRobotEvent): void { }
    public onHitWall(): void { }
    public onHitRobot(otherId: string): void { }
    public onBulletHit(targetId: string): void { }
    public onHitByBullet(bulletId: string, damage: number): void { }
    public onDeath(): void { }

    /**
     * Internal method used by the runner to collect intentions.
     */
    public _getIntentAndReset(): BotIntent {
        const intent = { ...this.currentIntent };
        // Reset transient intents
        this.currentIntent.firePower = 0;
        this.currentIntent.usePower = 0;
        return intent;
    }
}
