import type * as grpc from '@grpc/grpc-js';
import type { EnumTypeDefinition, MessageTypeDefinition } from '@grpc/proto-loader';

import type { BotIntent as _codearena_v1_BotIntent, BotIntent__Output as _codearena_v1_BotIntent__Output } from './codearena/v1/BotIntent';
import type { BotServiceClient as _codearena_v1_BotServiceClient, BotServiceDefinition as _codearena_v1_BotServiceDefinition } from './codearena/v1/BotService';
import type { BotState as _codearena_v1_BotState, BotState__Output as _codearena_v1_BotState__Output } from './codearena/v1/BotState';
import type { BulletHitTargetEvent as _codearena_v1_BulletHitTargetEvent, BulletHitTargetEvent__Output as _codearena_v1_BulletHitTargetEvent__Output } from './codearena/v1/BulletHitTargetEvent';
import type { BulletState as _codearena_v1_BulletState, BulletState__Output as _codearena_v1_BulletState__Output } from './codearena/v1/BulletState';
import type { DeathEvent as _codearena_v1_DeathEvent, DeathEvent__Output as _codearena_v1_DeathEvent__Output } from './codearena/v1/DeathEvent';
import type { HitByBulletEvent as _codearena_v1_HitByBulletEvent, HitByBulletEvent__Output as _codearena_v1_HitByBulletEvent__Output } from './codearena/v1/HitByBulletEvent';
import type { HitRobotEvent as _codearena_v1_HitRobotEvent, HitRobotEvent__Output as _codearena_v1_HitRobotEvent__Output } from './codearena/v1/HitRobotEvent';
import type { HitWallEvent as _codearena_v1_HitWallEvent, HitWallEvent__Output as _codearena_v1_HitWallEvent__Output } from './codearena/v1/HitWallEvent';
import type { MatchFinishedEvent as _codearena_v1_MatchFinishedEvent, MatchFinishedEvent__Output as _codearena_v1_MatchFinishedEvent__Output } from './codearena/v1/MatchFinishedEvent';
import type { SimulationEvent as _codearena_v1_SimulationEvent, SimulationEvent__Output as _codearena_v1_SimulationEvent__Output } from './codearena/v1/SimulationEvent';
import type { Vector3 as _codearena_v1_Vector3, Vector3__Output as _codearena_v1_Vector3__Output } from './codearena/v1/Vector3';
import type { WorldState as _codearena_v1_WorldState, WorldState__Output as _codearena_v1_WorldState__Output } from './codearena/v1/WorldState';
import type { ZoneEnteredEvent as _codearena_v1_ZoneEnteredEvent, ZoneEnteredEvent__Output as _codearena_v1_ZoneEnteredEvent__Output } from './codearena/v1/ZoneEnteredEvent';
import type { ZoneState as _codearena_v1_ZoneState, ZoneState__Output as _codearena_v1_ZoneState__Output } from './codearena/v1/ZoneState';

type SubtypeConstructor<Constructor extends new (...args: any) => any, Subtype> = {
  new(...args: ConstructorParameters<Constructor>): Subtype;
};

export interface ProtoGrpcType {
  codearena: {
    v1: {
      BotIntent: MessageTypeDefinition<_codearena_v1_BotIntent, _codearena_v1_BotIntent__Output>
      BotService: SubtypeConstructor<typeof grpc.Client, _codearena_v1_BotServiceClient> & { service: _codearena_v1_BotServiceDefinition }
      BotState: MessageTypeDefinition<_codearena_v1_BotState, _codearena_v1_BotState__Output>
      BulletHitTargetEvent: MessageTypeDefinition<_codearena_v1_BulletHitTargetEvent, _codearena_v1_BulletHitTargetEvent__Output>
      BulletState: MessageTypeDefinition<_codearena_v1_BulletState, _codearena_v1_BulletState__Output>
      DeathEvent: MessageTypeDefinition<_codearena_v1_DeathEvent, _codearena_v1_DeathEvent__Output>
      HitByBulletEvent: MessageTypeDefinition<_codearena_v1_HitByBulletEvent, _codearena_v1_HitByBulletEvent__Output>
      HitRobotEvent: MessageTypeDefinition<_codearena_v1_HitRobotEvent, _codearena_v1_HitRobotEvent__Output>
      HitWallEvent: MessageTypeDefinition<_codearena_v1_HitWallEvent, _codearena_v1_HitWallEvent__Output>
      MatchFinishedEvent: MessageTypeDefinition<_codearena_v1_MatchFinishedEvent, _codearena_v1_MatchFinishedEvent__Output>
      MatchStatus: EnumTypeDefinition
      PowerType: EnumTypeDefinition
      SimulationEvent: MessageTypeDefinition<_codearena_v1_SimulationEvent, _codearena_v1_SimulationEvent__Output>
      Vector3: MessageTypeDefinition<_codearena_v1_Vector3, _codearena_v1_Vector3__Output>
      WorldState: MessageTypeDefinition<_codearena_v1_WorldState, _codearena_v1_WorldState__Output>
      ZoneEnteredEvent: MessageTypeDefinition<_codearena_v1_ZoneEnteredEvent, _codearena_v1_ZoneEnteredEvent__Output>
      ZoneState: MessageTypeDefinition<_codearena_v1_ZoneState, _codearena_v1_ZoneState__Output>
    }
  }
}

