import { WaveData, Position } from './types';
import { City } from './City';
import { MissileBase } from './MissileBase';
import { ICBM } from './ICBM';
import {
  INITIAL_ICBM_COUNT,
  ICBM_COUNT_INCREMENT,
  MAX_ICBM_COUNT,
  INITIAL_ICBM_SPEED,
  ICBM_SPEED_INCREMENT,
  MAX_ICBM_SPEED,
  INITIAL_BASE_AMMO,
  WAVE_SPAWN_DURATION,
  CANVAS_WIDTH,
  GROUND_Y,
} from './constants';

let nextIcbmId = 0;

export class WaveManager {
  private _currentWave: number;

  constructor() {
    this._currentWave = 0;
  }

  get currentWave(): number {
    return this._currentWave;
  }

  // Generate wave configuration for a given wave number
  generateWave(waveNum: number): WaveData {
    // Calculate ICBM count: starts at 4, +2 per wave, max 20
    const icbmCount = Math.min(
      INITIAL_ICBM_COUNT + (waveNum - 1) * ICBM_COUNT_INCREMENT,
      MAX_ICBM_COUNT
    );

    // Calculate ICBM speed: starts at 60, +10 per wave, max 200
    const icbmSpeed = Math.min(
      INITIAL_ICBM_SPEED + (waveNum - 1) * ICBM_SPEED_INCREMENT,
      MAX_ICBM_SPEED
    );

    // Base ammo replenishment
    const baseAmmo = INITIAL_BASE_AMMO;

    return {
      number: waveNum,
      icbmCount,
      icbmSpeed,
      baseAmmo,
    };
  }

  // Create ICBMs for a wave with random targets
  createICBMs(
    wave: WaveData,
    cities: City[],
    bases: MissileBase[]
  ): ICBM[] {
    const icbms: ICBM[] = [];

    // Get valid targets (alive cities and bases)
    const targets = this.getValidTargets(cities, bases);
    if (targets.length === 0) {
      return icbms;
    }

    // Create ICBMs with random targets
    for (let i = 0; i < wave.icbmCount; i++) {
      const target = targets[Math.floor(Math.random() * targets.length)];
      const startX = Math.random() * (CANVAS_WIDTH - 40) + 20;
      const startY = 0;

      const icbm = new ICBM(
        nextIcbmId++,
        startX,
        startY,
        target.x,
        target.y,
        wave.icbmSpeed
      );

      icbms.push(icbm);
    }

    return icbms;
  }

  // Get spawn times staggered across the duration
  getSpawnTimes(count: number, duration: number = WAVE_SPAWN_DURATION): number[] {
    if (count <= 0) return [];
    if (count === 1) return [0];

    const times: number[] = [];
    const interval = duration / (count - 1);

    for (let i = 0; i < count; i++) {
      times.push(i * interval);
    }

    return times;
  }

  // Start the next wave
  nextWave(): WaveData {
    this._currentWave++;
    return this.generateWave(this._currentWave);
  }

  // Reset for new game
  reset(): void {
    this._currentWave = 0;
  }

  // Get valid targets (alive cities and bases)
  private getValidTargets(
    cities: City[],
    bases: MissileBase[]
  ): Position[] {
    const targets: Position[] = [];

    for (const city of cities) {
      if (city.alive) {
        targets.push({ x: city.x, y: GROUND_Y });
      }
    }

    for (const base of bases) {
      if (base.alive) {
        targets.push({ x: base.x, y: GROUND_Y });
      }
    }

    return targets;
  }
}
