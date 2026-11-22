import type { BotIntent, MatchState, ScannedRobotEvent } from './types';
import type { BulletHitTargetEvent__Output } from './generated/codearena/v1/BulletHitTargetEvent';
import type { HitByBulletEvent__Output } from './generated/codearena/v1/HitByBulletEvent';
import type { MatchFinishedEvent__Output } from './generated/codearena/v1/MatchFinishedEvent';
import type { ZoneEnteredEvent__Output } from './generated/codearena/v1/ZoneEnteredEvent';

/** Base class for CodeArena bots. Intents are collected per tick and reset
 * after the runner serializes them, so no action leaks into the next tick. */
export abstract class BaseBot {
  public id = '';
  public name = '';

  protected currentIntent: BotIntent = {
    moveDistance: 0,
    turnDegrees: 0,
    gunTurnDegrees: 0,
    radarTurnDegrees: 0,
    firePower: 0,
    usePower: 0,
  };

  public abstract run(state: MatchState): void;

  public ahead(distance: number): void {
    this.currentIntent.moveDistance = distance;
  }

  public back(distance: number): void {
    this.currentIntent.moveDistance = -distance;
  }

  public turn(degrees: number): void {
    this.currentIntent.turnDegrees = degrees;
  }

  public turnGun(degrees: number): void {
    this.currentIntent.gunTurnDegrees = degrees;
  }

  public turnRadar(degrees: number): void {
    this.currentIntent.radarTurnDegrees = degrees;
  }

  /** Fire with power 0.1-3.0; non-positive power means no fire. */
  public fire(power: number): void {
    this.currentIntent.firePower =
      power <= 0 ? 0 : Math.min(3, Math.max(0.1, power));
  }

  public activatePower(power: number): void {
    if (![0, 1, 2, 3].includes(power)) {
      throw new RangeError(`unknown power type: ${power}`);
    }
    this.currentIntent.usePower = power as 0 | 1 | 2 | 3;
  }

  /** Legacy hook; the v1 proto has no dedicated scanned-robot event. */
  public onScannedRobot(_event: ScannedRobotEvent): void {}
  public onHitByBullet(_event: HitByBulletEvent__Output): void {}
  public onBulletHitTarget(_event: BulletHitTargetEvent__Output): void {}
  public onHitWall(): void {}
  public onHitRobot(_otherId: string): void {}
  public onZoneEntered(_event: ZoneEnteredEvent__Output): void {}
  public onDeath(): void {}
  public onMatchFinished(_event: MatchFinishedEvent__Output): void {}

  /** Internal method used by BotRunner to collect and reset the intent. */
  public _getIntentAndReset(): BotIntent {
    const intent: BotIntent = { ...this.currentIntent };
    this.currentIntent = {
      moveDistance: 0,
      turnDegrees: 0,
      gunTurnDegrees: 0,
      radarTurnDegrees: 0,
      firePower: 0,
      usePower: 0,
    };
    return intent;
  }
}
