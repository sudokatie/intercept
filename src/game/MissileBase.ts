import { BaseData } from './types';
import { INITIAL_BASE_AMMO } from './constants';

export class MissileBase implements BaseData {
  readonly id: number;
  readonly x: number;
  readonly maxAmmo: number;
  private _ammo: number;
  private _alive: boolean;

  constructor(id: number, x: number, maxAmmo: number = INITIAL_BASE_AMMO) {
    this.id = id;
    this.x = x;
    this.maxAmmo = maxAmmo;
    this._ammo = maxAmmo;
    this._alive = true;
  }

  get ammo(): number {
    return this._ammo;
  }

  get alive(): boolean {
    return this._alive;
  }

  hasAmmo(): boolean {
    return this._alive && this._ammo > 0;
  }

  fire(): boolean {
    if (!this.hasAmmo()) {
      return false;
    }
    this._ammo--;
    return true;
  }

  refill(): void {
    this._ammo = this.maxAmmo;
  }

  destroy(): void {
    this._alive = false;
  }

  reset(): void {
    this._alive = true;
    this._ammo = this.maxAmmo;
  }

  getData(): BaseData {
    return {
      id: this.id,
      x: this.x,
      ammo: this._ammo,
      maxAmmo: this.maxAmmo,
      alive: this._alive,
    };
  }
}
