import { ICBM } from '../game/ICBM';
import { INITIAL_ICBM_SPEED, GROUND_Y } from '../game/constants';

describe('ICBM', () => {
  let icbm: ICBM;

  beforeEach(() => {
    // Start at top, target at ground
    icbm = new ICBM(0, 320, 0, 320, GROUND_Y);
  });

  describe('constructor', () => {
    it('should set initial position to start', () => {
      expect(icbm.x).toBe(320);
      expect(icbm.y).toBe(0);
    });

    it('should set target correctly', () => {
      expect(icbm.targetX).toBe(320);
      expect(icbm.targetY).toBe(GROUND_Y);
    });

    it('should start alive', () => {
      expect(icbm.alive).toBe(true);
    });

    it('should use default speed', () => {
      expect(icbm.speed).toBe(INITIAL_ICBM_SPEED);
    });

    it('should accept custom speed', () => {
      const fast = new ICBM(1, 0, 0, 100, 100, 200);
      expect(fast.speed).toBe(200);
    });
  });

  describe('update', () => {
    it('should move toward target', () => {
      const startY = icbm.y;
      icbm.update(0.1);
      expect(icbm.y).toBeGreaterThan(startY);
    });

    it('should not overshoot target', () => {
      icbm.update(100);
      expect(icbm.x).toBe(320);
      expect(icbm.y).toBe(GROUND_Y);
    });

    it('should not move when destroyed', () => {
      icbm.destroy();
      const y = icbm.y;
      icbm.update(1);
      expect(icbm.y).toBe(y);
    });
  });

  describe('hasLanded', () => {
    it('should return false initially', () => {
      expect(icbm.hasLanded()).toBe(false);
    });

    it('should return true when at ground level', () => {
      icbm.update(100);
      expect(icbm.hasLanded()).toBe(true);
    });

    it('should return false when destroyed', () => {
      icbm.update(100);
      icbm.destroy();
      expect(icbm.hasLanded()).toBe(false);
    });
  });

  describe('destroy', () => {
    it('should set alive to false', () => {
      icbm.destroy();
      expect(icbm.alive).toBe(false);
    });

    it('should be idempotent', () => {
      icbm.destroy();
      icbm.destroy();
      expect(icbm.alive).toBe(false);
    });
  });

  describe('getProgress', () => {
    it('should return 0 initially', () => {
      expect(icbm.getProgress()).toBeCloseTo(0);
    });

    it('should return 1 when at target', () => {
      icbm.update(100);
      expect(icbm.getProgress()).toBeCloseTo(1);
    });

    it('should return value between 0 and 1 during flight', () => {
      icbm.update(1);
      const progress = icbm.getProgress();
      expect(progress).toBeGreaterThan(0);
      expect(progress).toBeLessThan(1);
    });
  });

  describe('position', () => {
    it('should return current position', () => {
      const pos = icbm.position;
      expect(pos.x).toBe(320);
      expect(pos.y).toBe(0);
    });
  });

  describe('start', () => {
    it('should return start position', () => {
      icbm.update(1);
      const start = icbm.start;
      expect(start.x).toBe(320);
      expect(start.y).toBe(0);
    });
  });

  describe('target', () => {
    it('should return target position', () => {
      const target = icbm.target;
      expect(target.x).toBe(320);
      expect(target.y).toBe(GROUND_Y);
    });
  });

  describe('getData', () => {
    it('should return all data', () => {
      const data = icbm.getData();
      expect(data.id).toBe(0);
      expect(data.startX).toBe(320);
      expect(data.startY).toBe(0);
      expect(data.targetX).toBe(320);
      expect(data.targetY).toBe(GROUND_Y);
      expect(data.speed).toBe(INITIAL_ICBM_SPEED);
      expect(data.alive).toBe(true);
    });
  });
});
