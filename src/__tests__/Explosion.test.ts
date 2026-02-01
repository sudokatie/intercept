import { Explosion } from '../game/Explosion';
import {
  EXPLOSION_MAX_RADIUS,
  EXPLOSION_EXPAND_TIME,
  EXPLOSION_LINGER_TIME,
  EXPLOSION_FADE_TIME,
} from '../game/constants';

describe('Explosion', () => {
  let explosion: Explosion;

  beforeEach(() => {
    explosion = new Explosion(0, 100, 200);
  });

  describe('constructor', () => {
    it('should set position correctly', () => {
      expect(explosion.x).toBe(100);
      expect(explosion.y).toBe(200);
    });

    it('should start with radius 0', () => {
      expect(explosion.radius).toBe(0);
    });

    it('should start in expanding phase', () => {
      expect(explosion.phase).toBe('expanding');
    });

    it('should start with alpha 1', () => {
      expect(explosion.alpha).toBe(1);
    });

    it('should use default max radius', () => {
      expect(explosion.maxRadius).toBe(EXPLOSION_MAX_RADIUS);
    });

    it('should accept custom max radius', () => {
      const custom = new Explosion(1, 0, 0, 60);
      expect(custom.maxRadius).toBe(60);
    });
  });

  describe('update - expanding phase', () => {
    it('should increase radius during expanding', () => {
      explosion.update(EXPLOSION_EXPAND_TIME / 2);
      expect(explosion.radius).toBeGreaterThan(0);
      expect(explosion.radius).toBeLessThan(EXPLOSION_MAX_RADIUS);
    });

    it('should reach max radius at end of expanding', () => {
      explosion.update(EXPLOSION_EXPAND_TIME);
      expect(explosion.radius).toBeCloseTo(EXPLOSION_MAX_RADIUS);
    });

    it('should transition to lingering after expanding', () => {
      explosion.update(EXPLOSION_EXPAND_TIME + 0.01);
      expect(explosion.phase).toBe('lingering');
    });
  });

  describe('update - lingering phase', () => {
    beforeEach(() => {
      explosion.update(EXPLOSION_EXPAND_TIME + 0.01);
    });

    it('should maintain max radius during lingering', () => {
      explosion.update(EXPLOSION_LINGER_TIME / 2);
      expect(explosion.radius).toBe(EXPLOSION_MAX_RADIUS);
    });

    it('should maintain alpha 1 during lingering', () => {
      explosion.update(EXPLOSION_LINGER_TIME / 2);
      expect(explosion.alpha).toBe(1);
    });

    it('should transition to fading after lingering', () => {
      explosion.update(EXPLOSION_LINGER_TIME + 0.01);
      expect(explosion.phase).toBe('fading');
    });
  });

  describe('update - fading phase', () => {
    beforeEach(() => {
      explosion.update(EXPLOSION_EXPAND_TIME + 0.01);
      explosion.update(EXPLOSION_LINGER_TIME + 0.01);
    });

    it('should decrease alpha during fading', () => {
      explosion.update(EXPLOSION_FADE_TIME / 2);
      expect(explosion.alpha).toBeLessThan(1);
      expect(explosion.alpha).toBeGreaterThan(0);
    });

    it('should reach alpha 0 at end of fading', () => {
      explosion.update(EXPLOSION_FADE_TIME + 0.01);
      expect(explosion.alpha).toBe(0);
    });

    it('should maintain radius during fading', () => {
      explosion.update(EXPLOSION_FADE_TIME / 2);
      expect(explosion.radius).toBe(EXPLOSION_MAX_RADIUS);
    });
  });

  describe('isFinished', () => {
    it('should return false initially', () => {
      expect(explosion.isFinished()).toBe(false);
    });

    it('should return false during expanding', () => {
      explosion.update(EXPLOSION_EXPAND_TIME / 2);
      expect(explosion.isFinished()).toBe(false);
    });

    it('should return false during lingering', () => {
      explosion.update(EXPLOSION_EXPAND_TIME + 0.01);
      expect(explosion.isFinished()).toBe(false);
    });

    it('should return false during fading', () => {
      explosion.update(EXPLOSION_EXPAND_TIME + 0.01);
      explosion.update(EXPLOSION_LINGER_TIME + 0.01);
      explosion.update(EXPLOSION_FADE_TIME / 2);
      expect(explosion.isFinished()).toBe(false);
    });

    it('should return true after fading complete', () => {
      explosion.update(EXPLOSION_EXPAND_TIME + 0.01);
      explosion.update(EXPLOSION_LINGER_TIME + 0.01);
      explosion.update(EXPLOSION_FADE_TIME + 0.01);
      expect(explosion.isFinished()).toBe(true);
    });
  });

  describe('containsPoint', () => {
    it('should return true for center even when radius is 0', () => {
      // Distance 0 <= radius 0 is true
      expect(explosion.containsPoint(100, 200)).toBe(true);
    });

    it('should return false for non-center when radius is 0', () => {
      expect(explosion.containsPoint(101, 200)).toBe(false);
    });

    it('should return true for center when expanded', () => {
      explosion.update(EXPLOSION_EXPAND_TIME);
      expect(explosion.containsPoint(100, 200)).toBe(true);
    });

    it('should return true for point inside radius', () => {
      explosion.update(EXPLOSION_EXPAND_TIME);
      expect(explosion.containsPoint(100 + 10, 200 + 10)).toBe(true);
    });

    it('should return false for point outside radius', () => {
      explosion.update(EXPLOSION_EXPAND_TIME);
      expect(explosion.containsPoint(100 + 100, 200 + 100)).toBe(false);
    });

    it('should return true for point on edge', () => {
      explosion.update(EXPLOSION_EXPAND_TIME);
      expect(explosion.containsPoint(100 + EXPLOSION_MAX_RADIUS, 200)).toBe(true);
    });
  });

  describe('position', () => {
    it('should return position object', () => {
      const pos = explosion.position;
      expect(pos.x).toBe(100);
      expect(pos.y).toBe(200);
    });
  });

  describe('getData', () => {
    it('should return all data', () => {
      const data = explosion.getData();
      expect(data.id).toBe(0);
      expect(data.x).toBe(100);
      expect(data.y).toBe(200);
      expect(data.radius).toBe(0);
      expect(data.maxRadius).toBe(EXPLOSION_MAX_RADIUS);
      expect(data.phase).toBe('expanding');
      expect(data.alpha).toBe(1);
    });
  });
});
