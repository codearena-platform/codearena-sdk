// Original file: proto/v1/bot_api.proto

export const MatchStatus = {
  MATCH_STATUS_UNSPECIFIED: 0,
  WAITING: 1,
  RUNNING: 2,
  FINISHED: 3,
} as const;

export type MatchStatus =
  | 'MATCH_STATUS_UNSPECIFIED'
  | 0
  | 'WAITING'
  | 1
  | 'RUNNING'
  | 2
  | 'FINISHED'
  | 3

export type MatchStatus__Output = typeof MatchStatus[keyof typeof MatchStatus]
