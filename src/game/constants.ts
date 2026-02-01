// Canvas dimensions
export const CANVAS_WIDTH = 640;
export const CANVAS_HEIGHT = 480;
export const CANVAS_SCALE = 2;
export const DISPLAY_WIDTH = CANVAS_WIDTH * CANVAS_SCALE;
export const DISPLAY_HEIGHT = CANVAS_HEIGHT * CANVAS_SCALE;

// Ground level
export const GROUND_Y = 440;

// Cities
export const CITY_COUNT = 6;
export const CITY_WIDTH = 40;
export const CITY_HEIGHT = 30;

// Missile bases
export const BASE_COUNT = 3;
export const BASE_POSITIONS = [80, 320, 560];
export const INITIAL_BASE_AMMO = 10;

// Interceptor missile
export const INTERCEPTOR_SPEED = 400;

// Explosion settings
export const EXPLOSION_MAX_RADIUS = 40;
export const EXPLOSION_EXPAND_TIME = 0.3;
export const EXPLOSION_LINGER_TIME = 0.5;
export const EXPLOSION_FADE_TIME = 0.2;

// ICBM settings
export const INITIAL_ICBM_SPEED = 60;
export const ICBM_SPEED_INCREMENT = 10;
export const MAX_ICBM_SPEED = 200;
export const INITIAL_ICBM_COUNT = 4;
export const ICBM_COUNT_INCREMENT = 2;
export const MAX_ICBM_COUNT = 20;

// Collision
export const HIT_RADIUS = 30;

// Scoring
export const SCORE_ICBM = 25;
export const SCORE_CITY_BONUS = 100;
export const SCORE_AMMO_BONUS = 5;
export const BONUS_CITY_SCORE = 10000;

// Wave timing
export const WAVE_SPAWN_DURATION = 5; // Seconds to spawn all ICBMs

// Colors
export const COLORS = {
  skyTop: '#001133',
  skyBottom: '#220033',
  ground: '#444444',
  city: '#00ff00',
  cityDead: '#003300',
  base: '#00ffff',
  baseDead: '#003333',
  interceptorTrail: '#00aaff',
  interceptorHead: '#ffffff',
  icbmTrail: '#ff4400',
  icbmHead: '#ffff00',
  explosionCenter: '#ffffff',
  explosionMid: '#ffff00',
  explosionOuter: '#ff6600',
};
