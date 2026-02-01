import { CityData } from './types';

export class City implements CityData {
  readonly id: number;
  readonly x: number;
  private _alive: boolean;

  constructor(id: number, x: number) {
    this.id = id;
    this.x = x;
    this._alive = true;
  }

  get alive(): boolean {
    return this._alive;
  }

  destroy(): void {
    this._alive = false;
  }

  reset(): void {
    this._alive = true;
  }

  getData(): CityData {
    return {
      id: this.id,
      x: this.x,
      alive: this._alive,
    };
  }
}
