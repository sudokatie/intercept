import { Interceptor } from '../game/Interceptor';
import { INTERCEPTOR_SPEED } from '../game/constants';

describe('Interceptor', () => {
  let interceptor: Interceptor;

  beforeEach(() => {
    // Start at bottom, target at top
    interceptor = new Interceptor(0, 100, 400, 100, 100, 0);
  });

  describe('constructor', () => {
    it('should set initial position to start', () => {
      expect(interceptor.x).toBe(100);
      expect(interceptor.y).toBe(400);
    });

    it('should set target correctly', () => {
      expect(interceptor.targetX).toBe(100);
      expect(interceptor.targetY).toBe(100);
    });

    it('should set source base id', () => {
      expect(interceptor.sourceBaseId).toBe(0);
    });

    it('should not be arrived initially', () => {
      expect(interceptor.hasArrived()).toBe(false);
    });

    it('should use default speed', () => {
      expect(interceptor.speed).toBe(INTERCEPTOR_SPEED);
    });

    it('should accept custom speed', () => {
      const fast = new Interceptor(1, 0, 0, 100, 100, 0, 1000);
      expect(fast.speed).toBe(1000);
    });
  });

  describe('update', () => {
    it('should move toward target', () => {
      const startY = interceptor.y;
      interceptor.update(0.1);
      expect(interceptor.y).toBeLessThan(startY);
    });

    it('should not overshoot target', () => {
      // Update for long enough to reach target
      interceptor.update(10);
      expect(interceptor.x).toBe(100);
      expect(interceptor.y).toBe(100);
    });

    it('should set arrived when reaching target', () => {
      interceptor.update(10);
      expect(interceptor.hasArrived()).toBe(true);
    });

    it('should not move after arriving', () => {
      interceptor.update(10);
      const x = interceptor.x;
      const y = interceptor.y;
      interceptor.update(1);
      expect(interceptor.x).toBe(x);
      expect(interceptor.y).toBe(y);
    });
  });

  describe('getProgress', () => {
    it('should return 0 initially', () => {
      expect(interceptor.getProgress()).toBeCloseTo(0);
    });

    it('should return 1 when arrived', () => {
      interceptor.update(10);
      expect(interceptor.getProgress()).toBeCloseTo(1);
    });

    it('should return value between 0 and 1 during flight', () => {
      interceptor.update(0.3);
      const progress = interceptor.getProgress();
      expect(progress).toBeGreaterThan(0);
      expect(progress).toBeLessThan(1);
    });
  });

  describe('position', () => {
    it('should return current position', () => {
      const pos = interceptor.position;
      expect(pos.x).toBe(100);
      expect(pos.y).toBe(400);
    });
  });

  describe('target', () => {
    it('should return target position', () => {
      const target = interceptor.target;
      expect(target.x).toBe(100);
      expect(target.y).toBe(100);
    });
  });

  describe('getData', () => {
    it('should return all data', () => {
      const data = interceptor.getData();
      expect(data.id).toBe(0);
      expect(data.x).toBe(100);
      expect(data.y).toBe(400);
      expect(data.startX).toBe(100);
      expect(data.startY).toBe(400);
      expect(data.targetX).toBe(100);
      expect(data.targetY).toBe(100);
      expect(data.sourceBaseId).toBe(0);
      expect(data.speed).toBe(INTERCEPTOR_SPEED);
    });
  });
});
