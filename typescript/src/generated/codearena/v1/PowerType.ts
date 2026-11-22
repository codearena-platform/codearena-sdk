// Original file: proto/v1/bot_api.proto

export const PowerType = {
  POWER_NONE: 0,
  SHIELD: 1,
  OVERCLOCK: 2,
  STEALTH: 3,
} as const;

export type PowerType =
  | 'POWER_NONE'
  | 0
  | 'SHIELD'
  | 1
  | 'OVERCLOCK'
  | 2
  | 'STEALTH'
  | 3

export type PowerType__Output = typeof PowerType[keyof typeof PowerType]
