import { CityData } from './types';

const FLASH_DURATION = 0.15;

export class City implements CityData {
  readonly id: number;
  readonly x: number;
  private _alive: boolean;
  private _flashTimer: number;
  private _justDestroyed: boolean;

  constructor(id: number, x: number) {
    this.id = id;
    this.x = x;
    this._alive = true;
    this._flashTimer = 0;
    this._justDestroyed = false;
  }

  get alive(): boolean {
    return this._alive;
  }

  get isFlashing(): boolean {
    return this._flashTimer > 0;
  }

  get flashAlpha(): number {
    return this._flashTimer / FLASH_DURATION;
  }

  // Returns true if this destroy() call just killed the city (for particle spawn)
  destroy(): boolean {
    if (!this._alive) return false;
    this._alive = false;
    this._flashTimer = FLASH_DURATION;
    this._justDestroyed = true;
    return true;
  }

  // Check and clear the justDestroyed flag
  consumeDestroyEvent(): boolean {
    if (this._justDestroyed) {
      this._justDestroyed = false;
      return true;
    }
    return false;
  }

  update(dt: number): void {
    if (this._flashTimer > 0) {
      this._flashTimer -= dt;
      if (this._flashTimer < 0) this._flashTimer = 0;
    }
  }

  reset(): void {
    this._alive = true;
    this._flashTimer = 0;
    this._justDestroyed = false;
  }

  getData(): CityData {
    return {
      id: this.id,
      x: this.x,
      alive: this._alive,
    };
  }
}
