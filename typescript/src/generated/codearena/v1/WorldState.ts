// Original file: proto/v1/bot_api.proto

import type { MatchStatus as _codearena_v1_MatchStatus, MatchStatus__Output as _codearena_v1_MatchStatus__Output } from '../../codearena/v1/MatchStatus';
import type { BotState as _codearena_v1_BotState, BotState__Output as _codearena_v1_BotState__Output } from '../../codearena/v1/BotState';
import type { SimulationEvent as _codearena_v1_SimulationEvent, SimulationEvent__Output as _codearena_v1_SimulationEvent__Output } from '../../codearena/v1/SimulationEvent';
import type { BulletState as _codearena_v1_BulletState, BulletState__Output as _codearena_v1_BulletState__Output } from '../../codearena/v1/BulletState';
import type { ZoneState as _codearena_v1_ZoneState, ZoneState__Output as _codearena_v1_ZoneState__Output } from '../../codearena/v1/ZoneState';
import type { Long } from '@grpc/proto-loader';

export interface WorldState {
  'tick'?: (number | string | Long);
  'status'?: (_codearena_v1_MatchStatus);
  'bots'?: (_codearena_v1_BotState)[];
  'events'?: (_codearena_v1_SimulationEvent)[];
  'bullets'?: (_codearena_v1_BulletState)[];
  'zone'?: (_codearena_v1_ZoneState | null);
}

export interface WorldState__Output {
  'tick'?: (number);
  'status'?: (_codearena_v1_MatchStatus__Output);
  'bots'?: (_codearena_v1_BotState__Output)[];
  'events'?: (_codearena_v1_SimulationEvent__Output)[];
  'bullets'?: (_codearena_v1_BulletState__Output)[];
  'zone'?: (_codearena_v1_ZoneState__Output);
}
