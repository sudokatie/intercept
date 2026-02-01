import { InputHandler } from '../game/Input';
import { Direction } from '../game/types';

describe('InputHandler', () => {
  let input: InputHandler;

  beforeEach(() => {
    input = new InputHandler();
  });

  describe('constructor', () => {
    it('should initialize with no direction', () => {
      expect(input.getDirection(0)).toBe(Direction.None);
      expect(input.getDirection(1)).toBe(Direction.None);
    });
  });

  describe('getDirection', () => {
    it('should return None for invalid player', () => {
      expect(input.getDirection(99)).toBe(Direction.None);
    });
  });

  describe('isKeyPressed', () => {
    it('should return false for unpressed keys', () => {
      expect(input.isKeyPressed('w')).toBe(false);
      expect(input.isKeyPressed('ArrowUp')).toBe(false);
    });
  });

  describe('reset', () => {
    it('should clear all state', () => {
      input.reset();
      expect(input.getDirection(0)).toBe(Direction.None);
      expect(input.isKeyPressed('w')).toBe(false);
    });
  });

  describe('setCallback', () => {
    it('should accept callback without error', () => {
      const callback = jest.fn();
      expect(() => input.setCallback(callback)).not.toThrow();
    });
  });

  describe('attach/detach', () => {
    it('should not throw in non-browser environment', () => {
      expect(() => input.attach()).not.toThrow();
      expect(() => input.detach()).not.toThrow();
    });
  });
});
