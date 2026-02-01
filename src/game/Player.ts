import { Position, PlayerState, PlayerStats, Direction, BoundingBox, PowerUpType } from './types';
import { Arena } from './Arena';
import {
  DEFAULT_BOMBS,
  DEFAULT_FIRE,
  DEFAULT_SPEED,
  MAX_BOMBS,
  MAX_FIRE,
  MAX_SPEED,
  TILE_SIZE,
} from './constants';

export class Player {
  private _id: number;
  private _position: Position;
  private _state: PlayerState;
  private _stats: PlayerStats;
  private _direction: Direction;
  private _spawnPosition: Position;
  private _activeBombs: number;
  private _color: string;

  constructor(id: number, spawn: Position, color: string) {
    this._id = id;
    this._spawnPosition = { ...spawn };
    this._position = { x: spawn.x, y: spawn.y };
    this._state = PlayerState.Alive;
    this._direction = Direction.None;
    this._color = color;
    this._activeBombs = 0;
    this._stats = {
      bombs: DEFAULT_BOMBS,
      fire: DEFAULT_FIRE,
      speed: DEFAULT_SPEED,
      alive: true,
      wins: 0,
    };
  }

  get id(): number {
    return this._id;
  }

  get position(): Position {
    return { ...this._position };
  }

  get state(): PlayerState {
    return this._state;
  }

  get stats(): PlayerStats {
    return { ...this._stats };
  }

  get direction(): Direction {
    return this._direction;
  }

  get color(): string {
    return this._color;
  }

  get activeBombs(): number {
    return this._activeBombs;
  }

  isAlive(): boolean {
    return this._state === PlayerState.Alive;
  }

  move(direction: Direction, arena: Arena, dt: number): void {
    if (!this.isAlive()) return;

    this._direction = direction;
    if (direction === Direction.None) return;

    const speed = this._stats.speed * dt;
    let newX = this._position.x;
    let newY = this._position.y;

    switch (direction) {
      case Direction.Up:
        newY -= speed;
        break;
      case Direction.Down:
        newY += speed;
        break;
      case Direction.Left:
        newX -= speed;
        break;
      case Direction.Right:
        newX += speed;
        break;
    }

    // Check collision at new position
    if (this.canMoveTo(newX, newY, arena)) {
      this._position.x = newX;
      this._position.y = newY;
    } else {
      // Try sliding along walls
      if (direction === Direction.Up || direction === Direction.Down) {
        if (this.canMoveTo(this._position.x, newY, arena)) {
          this._position.y = newY;
        }
      } else {
        if (this.canMoveTo(newX, this._position.y, arena)) {
          this._position.x = newX;
        }
      }
    }
  }

  private canMoveTo(x: number, y: number, arena: Arena): boolean {
    // Check corners of player hitbox
    const margin = 0.2;
    const corners = [
      { x: x + margin, y: y + margin },
      { x: x + 1 - margin, y: y + margin },
      { x: x + margin, y: y + 1 - margin },
      { x: x + 1 - margin, y: y + 1 - margin },
    ];

    for (const corner of corners) {
      const gridX = Math.floor(corner.x);
      const gridY = Math.floor(corner.y);
      if (arena.isSolid(gridX, gridY)) {
        return false;
      }
    }

    return true;
  }

  dropBomb(): Position | null {
    if (!this.isAlive()) return null;
    if (this._activeBombs >= this._stats.bombs) return null;

    const gridPos = this.getGridPosition();
    this._activeBombs++;
    return gridPos;
  }

  onBombExploded(): void {
    if (this._activeBombs > 0) {
      this._activeBombs--;
    }
  }

  canDropBomb(): boolean {
    return this.isAlive() && this._activeBombs < this._stats.bombs;
  }

  collectPowerUp(type: PowerUpType): void {
    if (!this.isAlive()) return;

    switch (type) {
      case PowerUpType.BombUp:
        this._stats.bombs = Math.min(this._stats.bombs + 1, MAX_BOMBS);
        break;
      case PowerUpType.FireUp:
        this._stats.fire = Math.min(this._stats.fire + 1, MAX_FIRE);
        break;
      case PowerUpType.SpeedUp:
        this._stats.speed = Math.min(this._stats.speed + 1, MAX_SPEED);
        break;
    }
  }

  die(): void {
    this._state = PlayerState.Dead;
    this._stats.alive = false;
  }

  addWin(): void {
    this._stats.wins++;
  }

  reset(spawn: Position): void {
    this._position = { x: spawn.x, y: spawn.y };
    this._state = PlayerState.Alive;
    this._direction = Direction.None;
    this._activeBombs = 0;
    this._stats = {
      ...this._stats,
      bombs: DEFAULT_BOMBS,
      fire: DEFAULT_FIRE,
      speed: DEFAULT_SPEED,
      alive: true,
    };
  }

  getGridPosition(): Position {
    return {
      x: Math.floor(this._position.x + 0.5),
      y: Math.floor(this._position.y + 0.5),
    };
  }

  getBoundingBox(): BoundingBox {
    return {
      x: this._position.x * TILE_SIZE,
      y: this._position.y * TILE_SIZE,
      width: TILE_SIZE,
      height: TILE_SIZE,
    };
  }

  getFireRange(): number {
    return this._stats.fire;
  }
}
