// Original file: proto/v1/bot_api.proto


export interface HitByBulletEvent {
  'victimId'?: (string);
  'bulletId'?: (string);
  'damage'?: (number | string);
}

export interface HitByBulletEvent__Output {
  'victimId'?: (string);
  'bulletId'?: (string);
  'damage'?: (number);
}
