// Original file: proto/v1/bot_api.proto

import type { PowerType as _codearena_v1_PowerType, PowerType__Output as _codearena_v1_PowerType__Output } from '../../codearena/v1/PowerType';

export interface BotIntent {
  'moveDistance'?: (number | string);
  'turnDegrees'?: (number | string);
  'gunTurnDegrees'?: (number | string);
  'radarTurnDegrees'?: (number | string);
  'firePower'?: (number | string);
  'usePower'?: (_codearena_v1_PowerType);
}

export interface BotIntent__Output {
  'moveDistance'?: (number);
  'turnDegrees'?: (number);
  'gunTurnDegrees'?: (number);
  'radarTurnDegrees'?: (number);
  'firePower'?: (number);
  'usePower'?: (_codearena_v1_PowerType__Output);
}
