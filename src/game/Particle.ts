import { Position } from './types';

export interface ParticleData {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export class Particle {
  private _x: number;
  private _y: number;
  private _vx: number;
  private _vy: number;
  private _life: number;
  private _maxLife: number;
  private _color: string;
  private _size: number;

  constructor(
    x: number,
    y: number,
    vx: number,
    vy: number,
    life: number,
    color: string,
    size: number
  ) {
    this._x = x;
    this._y = y;
    this._vx = vx;
    this._vy = vy;
    this._life = life;
    this._maxLife = life;
    this._color = color;
    this._size = size;
  }

  get x(): number {
    return this._x;
  }

  get y(): number {
    return this._y;
  }

  get life(): number {
    return this._life;
  }

  get maxLife(): number {
    return this._maxLife;
  }

  get color(): string {
    return this._color;
  }

  get size(): number {
    return this._size;
  }

  get alpha(): number {
    return Math.max(0, this._life / this._maxLife);
  }

  update(dt: number): void {
    this._x += this._vx * dt;
    this._y += this._vy * dt;
    this._vy += 200 * dt; // gravity
    this._life -= dt;
  }

  isDead(): boolean {
    return this._life <= 0;
  }

  getData(): ParticleData {
    return {
      x: this._x,
      y: this._y,
      vx: this._vx,
      vy: this._vy,
      life: this._life,
      maxLife: this._maxLife,
      color: this._color,
      size: this._size,
    };
  }
}

// Create debris particles for city destruction
export function createCityDebris(x: number, y: number): Particle[] {
  const particles: Particle[] = [];
  const colors = ['#00ff00', '#00cc00', '#009900', '#ffffff', '#ffff00'];
  
  for (let i = 0; i < 15; i++) {
    const angle = Math.random() * Math.PI; // upward arc
    const speed = 100 + Math.random() * 150;
    const vx = Math.cos(angle) * speed * (Math.random() > 0.5 ? 1 : -1);
    const vy = -Math.sin(angle) * speed;
    const life = 0.5 + Math.random() * 0.5;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = 2 + Math.random() * 4;
    
    particles.push(new Particle(x, y, vx, vy, life, color, size));
  }
  
  return particles;
}
