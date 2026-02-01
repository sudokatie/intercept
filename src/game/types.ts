// Game state
export enum GameState {
  Menu = 'menu',
  Playing = 'playing',
  WaveEnd = 'wave_end',
  GameOver = 'game_over',
}

// Position
export interface Position {
  x: number;
  y: number;
}

// City data
export interface CityData {
  id: number;
  x: number;
  alive: boolean;
}

// Missile base data
export interface BaseData {
  id: number;
  x: number;
  ammo: number;
  maxAmmo: number;
  alive: boolean;
}

// Player interceptor missile
export interface InterceptorData {
  id: number;
  x: number;
  y: number;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  sourceBaseId: number;
  speed: number;
}

// Enemy ICBM
export interface ICBMData {
  id: number;
  x: number;
  y: number;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  speed: number;
  alive: boolean;
}

// Explosion phases
export type ExplosionPhase = 'expanding' | 'lingering' | 'fading';

// Explosion data
export interface ExplosionData {
  id: number;
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  phase: ExplosionPhase;
  timer: number;
  alpha: number;
}

// Wave configuration
export interface WaveData {
  number: number;
  icbmCount: number;
  icbmSpeed: number;
  baseAmmo: number;
}

// Collision result
export interface CollisionResult {
  destroyedICBMs: number[];
  hitCities: number[];
  hitBases: number[];
}
