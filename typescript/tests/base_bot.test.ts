import { BaseBot } from '../src/BaseBot';
import { PowerType } from '../src/types';

class TestBot extends BaseBot {
  public run(): void {}
}

describe('BaseBot', () => {
  it('serializes the intent and resets every transient field', () => {
    const bot = new TestBot();
    bot.ahead(10);
    bot.turn(-15);
    bot.turnGun(30);
    bot.turnRadar(45);
    bot.fire(9);
    bot.activatePower(PowerType.SHIELD);

    expect(bot._getIntentAndReset()).toEqual({
      moveDistance: 10,
      turnDegrees: -15,
      gunTurnDegrees: 30,
      radarTurnDegrees: 45,
      firePower: 3,
      usePower: 1,
    });
    expect(bot._getIntentAndReset()).toEqual({
      moveDistance: 0,
      turnDegrees: 0,
      gunTurnDegrees: 0,
      radarTurnDegrees: 0,
      firePower: 0,
      usePower: 0,
    });
  });

  it('clamps fire power and treats non-positive power as no fire', () => {
    const bot = new TestBot();
    bot.fire(0);
    expect(bot._getIntentAndReset().firePower).toBe(0);
    bot.fire(-1);
    expect(bot._getIntentAndReset().firePower).toBe(0);
    bot.fire(0.05);
    expect(bot._getIntentAndReset().firePower).toBeCloseTo(0.1);
  });

  it('rejects unknown power types', () => {
    const bot = new TestBot();
    expect(() => bot.activatePower(99)).toThrow(RangeError);
  });
});
