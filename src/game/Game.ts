import { GameState, Position } from './types';
import { City } from './City';
import { MissileBase } from './MissileBase';
import { Interceptor } from './Interceptor';
import { ICBM } from './ICBM';
import { Explosion } from './Explosion';
import { Particle, createCityDebris } from './Particle';
import { WaveManager } from './Wave';
import { checkAllCollisions } from './Collision';
import {
  CITY_COUNT,
  BASE_COUNT,
  BASE_POSITIONS,
  INITIAL_BASE_AMMO,
  INTERCEPTOR_SPEED,
  EXPLOSION_MAX_RADIUS,
  GROUND_Y,
  SCORE_ICBM,
  SCORE_CITY_BONUS,
  SCORE_AMMO_BONUS,
  BONUS_CITY_SCORE,
  CANVAS_WIDTH,
} from './constants';

let nextExplosionId = 0;
let nextInterceptorId = 0;

export class Game {
  private _state: GameState;
  private _score: number;
  private _cities: City[];
  private _bases: MissileBase[];
  private _interceptors: Interceptor[];
  private _icbms: ICBM[];
  private _explosions: Explosion[];
  private _particles: Particle[];
  private _waveManager: WaveManager;
  private _pendingICBMs: ICBM[];
  private _spawnTimers: number[];
  private _waveTimer: number;
  private _lastBonusCityThreshold: number;

  constructor() {
    this._state = GameState.Menu;
    this._score = 0;
    this._lastBonusCityThreshold = 0;
    this._cities = [];
    this._bases = [];
    this._interceptors = [];
    this._icbms = [];
    this._explosions = [];
    this._particles = [];
    this._waveManager = new WaveManager();
    this._pendingICBMs = [];
    this._spawnTimers = [];
    this._waveTimer = 0;

    this.initializeAssets();
  }

  private initializeAssets(): void {
    // Create cities evenly spaced
    const citySpacing = CANVAS_WIDTH / (CITY_COUNT + 1);
    for (let i = 0; i < CITY_COUNT; i++) {
      // Skip positions near bases
      let x = (i + 1) * citySpacing;
      // Adjust to avoid base positions
      if (i < 3) {
        x = 40 + i * 80; // Left side cities
      } else {
        x = 400 + (i - 3) * 80; // Right side cities
      }
      this._cities.push(new City(i, x));
    }

    // Create bases at fixed positions
    for (let i = 0; i < BASE_COUNT; i++) {
      this._bases.push(new MissileBase(i, BASE_POSITIONS[i], INITIAL_BASE_AMMO));
    }
  }

  get state(): GameState {
    return this._state;
  }

  get score(): number {
    return this._score;
  }

  // Add score (used for testing and potential future features)
  addScore(points: number): void {
    this._score += points;
  }

  get wave(): number {
    return this._waveManager.currentWave;
  }

  get cities(): City[] {
    return [...this._cities];
  }

  get bases(): MissileBase[] {
    return [...this._bases];
  }

  get interceptors(): Interceptor[] {
    return [...this._interceptors];
  }

  get icbms(): ICBM[] {
    return [...this._icbms];
  }

  get explosions(): Explosion[] {
    return [...this._explosions];
  }

  get particles(): Particle[] {
    return [...this._particles];
  }

  start(): void {
    this._state = GameState.Playing;
    this.startNextWave();
  }

  private startNextWave(): void {
    const wave = this._waveManager.nextWave();
    
    // Refill base ammo
    for (const base of this._bases) {
      if (base.alive) {
        base.refill();
      }
    }

    // Generate ICBMs for this wave
    this._pendingICBMs = this._waveManager.createICBMs(wave, this._cities, this._bases);
    this._spawnTimers = this._waveManager.getSpawnTimes(this._pendingICBMs.length);
    this._waveTimer = 0;
  }

  update(dt: number): void {
    if (this._state !== GameState.Playing) return;

    // Spawn pending ICBMs
    this._waveTimer += dt;
    while (this._spawnTimers.length > 0 && this._waveTimer >= this._spawnTimers[0]) {
      this._spawnTimers.shift();
      const icbm = this._pendingICBMs.shift();
      if (icbm) {
        this._icbms.push(icbm);
      }
    }

    // 1. Update interceptors
    for (const interceptor of this._interceptors) {
      interceptor.update(dt);
    }

    // 2. Check interceptor arrivals -> create explosions
    const arrivedInterceptors: Interceptor[] = [];
    for (const interceptor of this._interceptors) {
      if (interceptor.hasArrived()) {
        arrivedInterceptors.push(interceptor);
        const explosion = new Explosion(
          nextExplosionId++,
          interceptor.targetX,
          interceptor.targetY,
          EXPLOSION_MAX_RADIUS
        );
        this._explosions.push(explosion);
      }
    }
    this._interceptors = this._interceptors.filter(i => !arrivedInterceptors.includes(i));

    // 3. Update explosions
    for (const explosion of this._explosions) {
      explosion.update(dt);
    }

    // 4. Update ICBMs
    for (const icbm of this._icbms) {
      if (icbm.alive) {
        icbm.update(dt);
      }
    }

    // 5-6. Check collisions
    const collisionResult = checkAllCollisions(
      this._icbms,
      this._explosions,
      this._cities,
      this._bases
    );

    // Process collision results
    for (const icbmId of collisionResult.destroyedICBMs) {
      const icbm = this._icbms.find(i => i.id === icbmId);
      if (icbm && icbm.alive) {
        // Check if destroyed by explosion (not landing)
        const inExplosion = this._explosions.some(e => e.containsPoint(icbm.x, icbm.y));
        if (inExplosion) {
          this._score += SCORE_ICBM;
        }
        icbm.destroy();
      }
    }

    for (const cityId of collisionResult.hitCities) {
      const city = this._cities.find(c => c.id === cityId);
      if (city && city.alive) {
        if (city.destroy()) {
          // Spawn debris particles
          const debris = createCityDebris(city.x, GROUND_Y - 15);
          this._particles.push(...debris);
        }
      }
    }

    for (const baseId of collisionResult.hitBases) {
      const base = this._bases.find(b => b.id === baseId);
      if (base && base.alive) {
        base.destroy();
      }
    }

    // 7. Remove finished explosions
    this._explosions = this._explosions.filter(e => !e.isFinished());

    // 8. Remove destroyed ICBMs
    this._icbms = this._icbms.filter(i => i.alive);

    // 9. Update cities (flash timer)
    for (const city of this._cities) {
      city.update(dt);
    }

    // 10. Update and remove dead particles
    for (const particle of this._particles) {
      particle.update(dt);
    }
    this._particles = this._particles.filter(p => !p.isDead());

    // 11. Check wave end
    if (this._icbms.length === 0 && this._pendingICBMs.length === 0) {
      this.endWave();
    }

    // 12. Check game over
    if (this.getAliveCityCount() === 0) {
      this._state = GameState.GameOver;
    }
  }

  private endWave(): void {
    // Add bonus points for surviving cities and remaining ammo
    for (const city of this._cities) {
      if (city.alive) {
        this._score += SCORE_CITY_BONUS;
      }
    }
    for (const base of this._bases) {
      if (base.alive) {
        this._score += base.ammo * SCORE_AMMO_BONUS;
      }
    }

    // Check for bonus city (every BONUS_CITY_SCORE points)
    this.checkBonusCity();

    this._state = GameState.WaveEnd;
  }

  private checkBonusCity(): void {
    // Calculate how many bonus city thresholds we've crossed
    const currentThreshold = Math.floor(this._score / BONUS_CITY_SCORE) * BONUS_CITY_SCORE;
    
    // Award bonus cities for each new threshold crossed
    while (this._lastBonusCityThreshold < currentThreshold) {
      this._lastBonusCityThreshold += BONUS_CITY_SCORE;
      
      // Find a dead city to revive
      const deadCity = this._cities.find(c => !c.alive);
      if (deadCity) {
        deadCity.reset();
      }
    }
  }

  handleClick(x: number, y: number): void {
    if (this._state !== GameState.Playing) return;
    if (y >= GROUND_Y) return; // Can't click on ground

    // Find nearest base with ammo
    let nearestBase: MissileBase | null = null;
    let nearestDist = Infinity;

    for (const base of this._bases) {
      if (base.hasAmmo()) {
        const dist = Math.abs(base.x - x);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearestBase = base;
        }
      }
    }

    if (nearestBase && nearestBase.fire()) {
      const interceptor = new Interceptor(
        nextInterceptorId++,
        nearestBase.x,
        GROUND_Y,
        x,
        y,
        nearestBase.id,
        INTERCEPTOR_SPEED
      );
      this._interceptors.push(interceptor);
    }
  }

  continueToNextWave(): void {
    if (this._state !== GameState.WaveEnd) return;
    this._state = GameState.Playing;
    this.startNextWave();
  }

  pause(): void {
    // Only used if we add pause functionality
  }

  resume(): void {
    // Only used if we add pause functionality
  }

  reset(): void {
    this._state = GameState.Menu;
    this._score = 0;
    this._lastBonusCityThreshold = 0;
    this._interceptors = [];
    this._icbms = [];
    this._explosions = [];
    this._particles = [];
    this._pendingICBMs = [];
    this._spawnTimers = [];
    this._waveTimer = 0;
    this._waveManager.reset();

    // Reset all assets
    for (const city of this._cities) {
      city.reset();
    }
    for (const base of this._bases) {
      base.reset();
    }
  }

  getAliveCityCount(): number {
    return this._cities.filter(c => c.alive).length;
  }

  getAliveBaseCount(): number {
    return this._bases.filter(b => b.alive).length;
  }
}
