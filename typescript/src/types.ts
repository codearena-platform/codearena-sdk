import type { BotState__Output as ProtoBotState } from './generated/codearena/v1/BotState';
import type { BotIntent__Output as ProtoBotIntent } from './generated/codearena/v1/BotIntent';
import type { SimulationEvent__Output as ProtoSimulationEvent } from './generated/codearena/v1/SimulationEvent';
import type { Vector3__Output as ProtoVector3 } from './generated/codearena/v1/Vector3';
import type { WorldState__Output as ProtoWorldState } from './generated/codearena/v1/WorldState';
import type { PowerType__Output } from './generated/codearena/v1/PowerType';

export { MatchStatus } from './generated/codearena/v1/MatchStatus';
export { PowerType } from './generated/codearena/v1/PowerType';
export type { ProtoGrpcType } from './generated/bot_api';
export type { BotServiceClient } from './generated/codearena/v1/BotService';

// Output types from the generated proto-loader definitions are the source of
// truth. Keeping aliases here avoids a second, drifting definition.
export type Vector3 = ProtoVector3;
export type BotState = ProtoBotState;
export type WorldState = ProtoWorldState;
export type SimulationEvent = ProtoSimulationEvent;
export type BotIntent = Omit<Required<ProtoBotIntent>, 'usePower'> & {
  usePower: PowerType__Output;
};

export type {
  ProtoBotState,
  ProtoBotIntent,
  ProtoSimulationEvent,
  ProtoVector3,
  ProtoWorldState,
};

/** A world state augmented with the bot controlled by this runner. */
export interface MatchState extends WorldState {
  me: BotState;
}

/** Legacy hook type; the v1 proto has no dedicated scanned-robot event. */
export interface ScannedRobotEvent {
  id: string;
  name: string;
  distance: number;
  bearing: number;
  position: Vector3;
}
