export interface Vector2 {
    x: number;
    y: number;
}

export interface BotState {
    id: string;
    name: string;
    position: Vector2;
    heading: number;
    gunHeading: number;
    radarHeading: number;
    velocity: number;
    energy: number;
    hull: number;
    heat: number;
    shieldHp: number;
    isStealthed: boolean;
    cooldowns: Record<string, number>;
}

export enum PowerType {
    NONE = 0,
    SHIELD = 1,
    OVERCLOCK = 2,
    STEALTH = 3,
}

export interface MatchState {
    tick: number;
    bots: BotState[];
    me: BotState;
}

export interface BotIntent {
    moveDistance: number;
    turnDegrees: number;
    gunTurnDegrees: number;
    radarTurnDegrees: number;
    firePower: number;
    usePower: PowerType;
}

export interface ScannedRobotEvent {
    id: string;
    name: string;
    distance: number;
    bearing: number;
    position: Vector2;
}
