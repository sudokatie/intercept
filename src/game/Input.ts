import { Direction } from './types';
import { PLAYER_CONTROLS } from './constants';

export type InputCallback = (playerId: number, action: 'move' | 'bomb', direction?: Direction) => void;

export class InputHandler {
  private keyStates: Map<string, boolean>;
  private playerDirections: Direction[];
  private callback: InputCallback | null;
  private boundKeyDown: (e: KeyboardEvent) => void;
  private boundKeyUp: (e: KeyboardEvent) => void;

  constructor() {
    this.keyStates = new Map();
    this.playerDirections = [Direction.None, Direction.None, Direction.None, Direction.None];
    this.callback = null;
    this.boundKeyDown = this.handleKeyDown.bind(this);
    this.boundKeyUp = this.handleKeyUp.bind(this);
  }

  setCallback(callback: InputCallback): void {
    this.callback = callback;
  }

  attach(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', this.boundKeyDown);
      window.addEventListener('keyup', this.boundKeyUp);
    }
  }

  detach(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', this.boundKeyDown);
      window.removeEventListener('keyup', this.boundKeyUp);
    }
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (this.keyStates.get(e.key)) return; // Already pressed
    this.keyStates.set(e.key, true);

    for (let playerId = 0; playerId < PLAYER_CONTROLS.length; playerId++) {
      const controls = PLAYER_CONTROLS[playerId];
      
      // Check movement
      const direction = this.keyToDirection(e.key, controls);
      if (direction !== Direction.None) {
        this.playerDirections[playerId] = direction;
        e.preventDefault();
      }

      // Check bomb
      if (e.key === controls.bomb) {
        if (this.callback) {
          this.callback(playerId, 'bomb');
        }
        e.preventDefault();
      }
    }
  }

  private handleKeyUp(e: KeyboardEvent): void {
    this.keyStates.set(e.key, false);

    for (let playerId = 0; playerId < PLAYER_CONTROLS.length; playerId++) {
      const controls = PLAYER_CONTROLS[playerId];
      
      // Check if released key was a movement key
      const releasedDirection = this.keyToDirection(e.key, controls);
      if (releasedDirection !== Direction.None) {
        // Check if any other direction is still pressed
        const newDirection = this.getCurrentDirection(controls);
        this.playerDirections[playerId] = newDirection;
      }
    }
  }

  private keyToDirection(key: string, controls: typeof PLAYER_CONTROLS[0]): Direction {
    if (key === controls.up) return Direction.Up;
    if (key === controls.down) return Direction.Down;
    if (key === controls.left) return Direction.Left;
    if (key === controls.right) return Direction.Right;
    return Direction.None;
  }

  private getCurrentDirection(controls: typeof PLAYER_CONTROLS[0]): Direction {
    // Priority: last pressed direction among those still held
    if (this.keyStates.get(controls.up)) return Direction.Up;
    if (this.keyStates.get(controls.down)) return Direction.Down;
    if (this.keyStates.get(controls.left)) return Direction.Left;
    if (this.keyStates.get(controls.right)) return Direction.Right;
    return Direction.None;
  }

  getDirection(playerId: number): Direction {
    return this.playerDirections[playerId] || Direction.None;
  }

  isKeyPressed(key: string): boolean {
    return this.keyStates.get(key) || false;
  }

  reset(): void {
    this.keyStates.clear();
    this.playerDirections = [Direction.None, Direction.None, Direction.None, Direction.None];
  }
}
