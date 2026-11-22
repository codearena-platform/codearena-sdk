// Original file: proto/v1/bot_api.proto

import type { Vector3 as _codearena_v1_Vector3, Vector3__Output as _codearena_v1_Vector3__Output } from '../../codearena/v1/Vector3';

export interface BulletState {
  'id'?: (string);
  'ownerId'?: (string);
  'position'?: (_codearena_v1_Vector3 | null);
  'heading'?: (number | string);
  'velocity'?: (number | string);
  'power'?: (number | string);
}

export interface BulletState__Output {
  'id'?: (string);
  'ownerId'?: (string);
  'position'?: (_codearena_v1_Vector3__Output);
  'heading'?: (number);
  'velocity'?: (number);
  'power'?: (number);
}
