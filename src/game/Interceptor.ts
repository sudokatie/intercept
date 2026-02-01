import { Position, InterceptorData } from './types';
import { INTERCEPTOR_SPEED, GROUND_Y } from './constants';

export class Interceptor {
  readonly id: number;
  readonly startX: number;
  readonly startY: number;
  readonly targetX: number;
  readonly targetY: number;
  readonly sourceBaseId: number;
  readonly speed: number;
  
  private _x: number;
  private _y: number;
  private _arrived: boolean;

  constructor(
    id: number,
    startX: number,
    startY: number,
    targetX: number,
    targetY: number,
    sourceBaseId: number,
    speed: number = INTERCEPTOR_SPEED
  ) {
    this.id = id;
    this.startX = startX;
    this.startY = startY;
    this.targetX = targetX;
    this.targetY = targetY;
    this.sourceBaseId = sourceBaseId;
    this.speed = speed;
    this._x = startX;
    this._y = startY;
    this._arrived = false;
  }

  get x(): number {
    return this._x;
  }

  get y(): number {
    return this._y;
  }

  get position(): Position {
    return { x: this._x, y: this._y };
  }

  get target(): Position {
    return { x: this.targetX, y: this.targetY };
  }

  update(dt: number): void {
    if (this._arrived) return;

    const dx = this.targetX - this._x;
    const dy = this.targetY - this._y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist <= this.speed * dt) {
      this._x = this.targetX;
      this._y = this.targetY;
      this._arrived = true;
    } else {
      const moveX = (dx / dist) * this.speed * dt;
      const moveY = (dy / dist) * this.speed * dt;
      this._x += moveX;
      this._y += moveY;
    }
  }

  hasArrived(): boolean {
    return this._arrived;
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

  getData(): InterceptorData {
    return {
      id: this.id,
      x: this._x,
      y: this._y,
      startX: this.startX,
      startY: this.startY,
      targetX: this.targetX,
      targetY: this.targetY,
      sourceBaseId: this.sourceBaseId,
      speed: this.speed,
    };
  }
}
