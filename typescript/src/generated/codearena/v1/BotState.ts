// Original file: proto/v1/bot_api.proto

import type { Vector3 as _codearena_v1_Vector3, Vector3__Output as _codearena_v1_Vector3__Output } from '../../codearena/v1/Vector3';

export interface BotState {
  'id'?: (string);
  'name'?: (string);
  'position'?: (_codearena_v1_Vector3 | null);
  'heading'?: (number | string);
  'gunHeading'?: (number | string);
  'radarHeading'?: (number | string);
  'velocity'?: (number | string);
  'energy'?: (number | string);
  'hull'?: (number | string);
  'heat'?: (number | string);
  'shieldHp'?: (number | string);
  'isStealthed'?: (boolean);
  'cooldowns'?: ({[key: string]: number});
  'class'?: (string);
  'teamId'?: (string);
}

export interface BotState__Output {
  'id'?: (string);
  'name'?: (string);
  'position'?: (_codearena_v1_Vector3__Output);
  'heading'?: (number);
  'gunHeading'?: (number);
  'radarHeading'?: (number);
  'velocity'?: (number);
  'energy'?: (number);
  'hull'?: (number);
  'heat'?: (number);
  'shieldHp'?: (number);
  'isStealthed'?: (boolean);
  'cooldowns'?: ({[key: string]: number});
  'class'?: (string);
  'teamId'?: (string);
}
