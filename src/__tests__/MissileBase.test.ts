import { MissileBase } from '../game/MissileBase';
import { INITIAL_BASE_AMMO } from '../game/constants';

describe('MissileBase', () => {
  let base: MissileBase;

  beforeEach(() => {
    base = new MissileBase(0, 80);
  });

  describe('constructor', () => {
    it('should set id correctly', () => {
      expect(base.id).toBe(0);
    });

    it('should set x position correctly', () => {
      expect(base.x).toBe(80);
    });

    it('should start with max ammo', () => {
      expect(base.ammo).toBe(INITIAL_BASE_AMMO);
    });

    it('should start alive', () => {
      expect(base.alive).toBe(true);
    });

    it('should accept custom max ammo', () => {
      const customBase = new MissileBase(1, 100, 5);
      expect(customBase.ammo).toBe(5);
      expect(customBase.maxAmmo).toBe(5);
    });
  });

  describe('hasAmmo', () => {
    it('should return true when ammo available', () => {
      expect(base.hasAmmo()).toBe(true);
    });

    it('should return false when ammo depleted', () => {
      for (let i = 0; i < INITIAL_BASE_AMMO; i++) {
        base.fire();
      }
      expect(base.hasAmmo()).toBe(false);
    });

    it('should return false when destroyed', () => {
      base.destroy();
      expect(base.hasAmmo()).toBe(false);
    });
  });

  describe('fire', () => {
    it('should decrement ammo', () => {
      const initialAmmo = base.ammo;
      base.fire();
      expect(base.ammo).toBe(initialAmmo - 1);
    });

    it('should return true on success', () => {
      expect(base.fire()).toBe(true);
    });

    it('should return false when no ammo', () => {
      for (let i = 0; i < INITIAL_BASE_AMMO; i++) {
        base.fire();
      }
      expect(base.fire()).toBe(false);
    });

    it('should return false when destroyed', () => {
      base.destroy();
      expect(base.fire()).toBe(false);
    });

    it('should not go below zero', () => {
      for (let i = 0; i < INITIAL_BASE_AMMO + 5; i++) {
        base.fire();
      }
      expect(base.ammo).toBe(0);
    });
  });

  describe('refill', () => {
    it('should restore ammo to max', () => {
      base.fire();
      base.fire();
      base.refill();
      expect(base.ammo).toBe(INITIAL_BASE_AMMO);
    });
  });

  describe('destroy', () => {
    it('should set alive to false', () => {
      base.destroy();
      expect(base.alive).toBe(false);
    });
  });

  describe('reset', () => {
    it('should set alive to true', () => {
      base.destroy();
      base.reset();
      expect(base.alive).toBe(true);
    });

    it('should restore ammo to max', () => {
      base.fire();
      base.fire();
      base.reset();
      expect(base.ammo).toBe(INITIAL_BASE_AMMO);
    });
  });

  describe('getData', () => {
    it('should return correct data', () => {
      const data = base.getData();
      expect(data.id).toBe(0);
      expect(data.x).toBe(80);
      expect(data.ammo).toBe(INITIAL_BASE_AMMO);
      expect(data.maxAmmo).toBe(INITIAL_BASE_AMMO);
      expect(data.alive).toBe(true);
    });
  });
});
