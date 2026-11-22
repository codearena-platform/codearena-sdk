import { BaseBot } from './BaseBot';
import { MatchState, ScannedRobotEvent } from './types';

/** Sample bot demonstrating radar scanning and periodic firing. */
export class Voyager extends BaseBot {
  public run(state: MatchState): void {
    this.ahead(5);
    this.turn(2);
    this.turnGun(20);

    const energy = state.me.energy ?? 0;
    const heat = state.me.heat ?? 0;
    if (energy > 10 && heat === 0) {
      this.fire(1.5);
    }
  }

  public onScannedRobot(event: ScannedRobotEvent): void {
    this.turnGun(event.bearing);
    this.fire(3);
  }

  public onHitWall(): void {
    this.back(50);
    this.turn(45);
  }
}
