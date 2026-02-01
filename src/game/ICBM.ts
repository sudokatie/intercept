import { Position, ICBMData } from './types';
import { GROUND_Y, INITIAL_ICBM_SPEED } from './constants';

export class ICBM {
  readonly id: number;
  readonly startX: number;
  readonly startY: number;
  readonly targetX: number;
  readonly targetY: number;
  readonly speed: number;
  
  private _x: number;
  private _y: number;
  private _alive: boolean;

  constructor(
    id: number,
    startX: number,
    startY: number,
    targetX: number,
    targetY: number,
    speed: number = INITIAL_ICBM_SPEED
  ) {
    this.id = id;
    this.startX = startX;
    this.startY = startY;
    this.targetX = targetX;
    this.targetY = targetY;
    this.speed = speed;
    this._x = startX;
    this._y = startY;
    this._alive = true;
  }

  get x(): number {
    return this._x;
  }

  get y(): number {
    return this._y;
  }

  get alive(): boolean {
    return this._alive;
  }

  get position(): Position {
    return { x: this._x, y: this._y };
  }

  get start(): Position {
    return { x: this.startX, y: this.startY };
  }

  get target(): Position {
    return { x: this.targetX, y: this.targetY };
  }

  update(dt: number): void {
    if (!this._alive) return;

    const dx = this.targetX - this._x;
    const dy = this.targetY - this._y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist <= this.speed * dt) {
      this._x = this.targetX;
      this._y = this.targetY;
    } else {
      const moveX = (dx / dist) * this.speed * dt;
      const moveY = (dy / dist) * this.speed * dt;
      this._x += moveX;
      this._y += moveY;
    }
  }

  hasLanded(): boolean {
    return this._alive && this._y >= GROUND_Y;
  }

  destroy(): void {
    this._alive = false;
  }

  getProgress(): number {
    const totalDist = Math.sqrt(
      (this.targetX - this.startX) ** 2 + (this.targetY - this.startY) ** 2
    );
    const currentDist = Math.sqrt(
      (this._x - this.startX) ** 2 + (this._y - this.startY) ** 2
    );
    return totalDist > 0 ? currentDist / totalDist : 1;
  }

  getData(): ICBMData {
    return {
      id: this.id,
      x: this._x,
      y: this._y,
      startX: this.startX,
      startY: this.startY,
      targetX: this.targetX,
      targetY: this.targetY,
      speed: this.speed,
      alive: this._alive,
    };
  }
}
