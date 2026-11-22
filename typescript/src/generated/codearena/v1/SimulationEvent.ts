// Original file: proto/v1/bot_api.proto

import type { HitByBulletEvent as _codearena_v1_HitByBulletEvent, HitByBulletEvent__Output as _codearena_v1_HitByBulletEvent__Output } from '../../codearena/v1/HitByBulletEvent';
import type { BulletHitTargetEvent as _codearena_v1_BulletHitTargetEvent, BulletHitTargetEvent__Output as _codearena_v1_BulletHitTargetEvent__Output } from '../../codearena/v1/BulletHitTargetEvent';
import type { HitWallEvent as _codearena_v1_HitWallEvent, HitWallEvent__Output as _codearena_v1_HitWallEvent__Output } from '../../codearena/v1/HitWallEvent';
import type { HitRobotEvent as _codearena_v1_HitRobotEvent, HitRobotEvent__Output as _codearena_v1_HitRobotEvent__Output } from '../../codearena/v1/HitRobotEvent';
import type { ZoneEnteredEvent as _codearena_v1_ZoneEnteredEvent, ZoneEnteredEvent__Output as _codearena_v1_ZoneEnteredEvent__Output } from '../../codearena/v1/ZoneEnteredEvent';
import type { DeathEvent as _codearena_v1_DeathEvent, DeathEvent__Output as _codearena_v1_DeathEvent__Output } from '../../codearena/v1/DeathEvent';
import type { MatchFinishedEvent as _codearena_v1_MatchFinishedEvent, MatchFinishedEvent__Output as _codearena_v1_MatchFinishedEvent__Output } from '../../codearena/v1/MatchFinishedEvent';
import type { Long } from '@grpc/proto-loader';

export interface SimulationEvent {
  'tick'?: (number | string | Long);
  'hitByBullet'?: (_codearena_v1_HitByBulletEvent | null);
  'bulletHitTarget'?: (_codearena_v1_BulletHitTargetEvent | null);
  'hitWall'?: (_codearena_v1_HitWallEvent | null);
  'hitRobot'?: (_codearena_v1_HitRobotEvent | null);
  'zoneEntered'?: (_codearena_v1_ZoneEnteredEvent | null);
  'death'?: (_codearena_v1_DeathEvent | null);
  'matchFinished'?: (_codearena_v1_MatchFinishedEvent | null);
  'event'?: "hitByBullet"|"bulletHitTarget"|"hitWall"|"hitRobot"|"zoneEntered"|"death"|"matchFinished";
}

export interface SimulationEvent__Output {
  'tick'?: (number);
  'hitByBullet'?: (_codearena_v1_HitByBulletEvent__Output);
  'bulletHitTarget'?: (_codearena_v1_BulletHitTargetEvent__Output);
  'hitWall'?: (_codearena_v1_HitWallEvent__Output);
  'hitRobot'?: (_codearena_v1_HitRobotEvent__Output);
  'zoneEntered'?: (_codearena_v1_ZoneEnteredEvent__Output);
  'death'?: (_codearena_v1_DeathEvent__Output);
  'matchFinished'?: (_codearena_v1_MatchFinishedEvent__Output);
  'event'?: "hitByBullet"|"bulletHitTarget"|"hitWall"|"hitRobot"|"zoneEntered"|"death"|"matchFinished";
}
