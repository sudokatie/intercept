import { Position, ExplosionData, ExplosionPhase } from './types';
import {
  EXPLOSION_MAX_RADIUS,
  EXPLOSION_EXPAND_TIME,
  EXPLOSION_LINGER_TIME,
  EXPLOSION_FADE_TIME,
} from './constants';

export class Explosion {
  readonly id: number;
  readonly x: number;
  readonly y: number;
  readonly maxRadius: number;
  
  private _radius: number;
  private _phase: ExplosionPhase;
  private _timer: number;
  private _alpha: number;

  constructor(
    id: number,
    x: number,
    y: number,
    maxRadius: number = EXPLOSION_MAX_RADIUS
  ) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.maxRadius = maxRadius;
    this._radius = 0;
    this._phase = 'expanding';
    this._timer = EXPLOSION_EXPAND_TIME;
    this._alpha = 1;
  }

  get radius(): number {
    return this._radius;
  }

  get phase(): ExplosionPhase {
    return this._phase;
  }

  get alpha(): number {
    return this._alpha;
  }

  get position(): Position {
    return { x: this.x, y: this.y };
  }

  update(dt: number): void {
    this._timer -= dt;

    switch (this._phase) {
      case 'expanding':
        // Grow radius from 0 to maxRadius
        const expandProgress = 1 - this._timer / EXPLOSION_EXPAND_TIME;
        this._radius = this.maxRadius * Math.min(1, expandProgress);
        
        if (this._timer <= 0) {
          this._phase = 'lingering';
          this._timer = EXPLOSION_LINGER_TIME;
          this._radius = this.maxRadius;
        }
        break;

      case 'lingering':
        // Stay at max radius
        this._radius = this.maxRadius;
        
        if (this._timer <= 0) {
          this._phase = 'fading';
          this._timer = EXPLOSION_FADE_TIME;
        }
        break;

      case 'fading':
        // Decrease alpha while maintaining radius
        const fadeProgress = 1 - this._timer / EXPLOSION_FADE_TIME;
        this._alpha = 1 - Math.min(1, fadeProgress);
        
        if (this._timer <= 0) {
          this._alpha = 0;
        }
        break;
    }
  }

  isFinished(): boolean {
    return this._phase === 'fading' && this._timer <= 0;
  }

  containsPoint(px: number, py: number): boolean {
    const dx = px - this.x;
    const dy = py - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    return dist <= this._radius;
  }

  getData(): ExplosionData {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      radius: this._radius,
      maxRadius: this.maxRadius,
      phase: this._phase,
      timer: this._timer,
      alpha: this._alpha,
    };
  }
}
