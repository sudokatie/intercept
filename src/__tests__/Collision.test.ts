import { icbmInExplosion, findHitAsset, checkAllCollisions } from '../game/Collision';
import { ICBM } from '../game/ICBM';
import { Explosion } from '../game/Explosion';
import { City } from '../game/City';
import { MissileBase } from '../game/MissileBase';
import { GROUND_Y, HIT_RADIUS, EXPLOSION_MAX_RADIUS } from '../game/constants';

describe('Collision', () => {
  describe('icbmInExplosion', () => {
    it('should return true when ICBM inside explosion', () => {
      // Create ICBM starting at position inside explosion
      const icbmInside = new ICBM(1, 100, 100, 100, GROUND_Y, 60);
      const explosion = new Explosion(0, 100, 100, 40);
      explosion.update(0.3); // Fully expanded
      
      expect(icbmInExplosion(icbmInside, explosion)).toBe(true);
    });

    it('should return false when ICBM outside explosion', () => {
      const icbm = new ICBM(0, 300, 300, 300, GROUND_Y, 60);
      const explosion = new Explosion(0, 100, 100, 40);
      explosion.update(0.3); // Fully expanded
      
      expect(icbmInExplosion(icbm, explosion)).toBe(false);
    });

    it('should return false for dead ICBM', () => {
      const icbm = new ICBM(0, 100, 100, 100, GROUND_Y, 60);
      icbm.destroy();
      const explosion = new Explosion(0, 100, 100, 40);
      explosion.update(0.3);
      
      expect(icbmInExplosion(icbm, explosion)).toBe(false);
    });

    it('should detect ICBM on edge of explosion', () => {
      const explosion = new Explosion(0, 100, 100, 40);
      explosion.update(0.3); // Fully expanded to radius 40
      
      // ICBM exactly on edge
      const icbmOnEdge = new ICBM(0, 140, 100, 140, GROUND_Y, 60);
      expect(icbmInExplosion(icbmOnEdge, explosion)).toBe(true);
    });
  });

  describe('findHitAsset', () => {
    let cities: City[];
    let bases: MissileBase[];

    beforeEach(() => {
      cities = [
        new City(0, 100),
        new City(1, 200),
        new City(2, 300),
      ];
      bases = [
        new MissileBase(0, 150),
        new MissileBase(1, 250),
      ];
    });

    it('should find city within hit radius', () => {
      const hit = findHitAsset(100 + HIT_RADIUS - 5, cities, bases);
      expect(hit).toBe(cities[0]);
    });

    it('should find base within hit radius', () => {
      // Use x=150 which is only near base[0] at 150, not near any city
      const hit = findHitAsset(150, cities, bases);
      expect(hit).toBe(bases[0]);
    });

    it('should return null when missing all assets', () => {
      const hit = findHitAsset(500, cities, bases);
      expect(hit).toBeNull();
    });

    it('should not hit destroyed city', () => {
      cities[0].destroy();
      const hit = findHitAsset(100, cities, bases);
      expect(hit).not.toBe(cities[0]);
    });

    it('should not hit destroyed base', () => {
      bases[0].destroy();
      const hit = findHitAsset(150, cities, bases);
      expect(hit).not.toBe(bases[0]);
    });
  });

  describe('checkAllCollisions', () => {
    let cities: City[];
    let bases: MissileBase[];

    beforeEach(() => {
      cities = [new City(0, 100)];
      bases = [new MissileBase(0, 200)];
    });

    it('should destroy ICBM in explosion', () => {
      const icbm = new ICBM(0, 100, 100, 100, GROUND_Y, 60);
      const explosion = new Explosion(0, 100, 100, 40);
      explosion.update(0.3);

      const result = checkAllCollisions([icbm], [explosion], cities, bases);
      expect(result.destroyedICBMs).toContain(0);
    });

    it('should detect city hit on landing', () => {
      // Create ICBM that has already landed
      const icbm = new ICBM(0, 100, 0, 100, GROUND_Y, 60);
      // Update until landed
      for (let i = 0; i < 100; i++) {
        icbm.update(0.1);
        if (icbm.hasLanded()) break;
      }

      const result = checkAllCollisions([icbm], [], cities, bases);
      expect(result.hitCities).toContain(0);
      expect(result.destroyedICBMs).toContain(0);
    });

    it('should detect base hit on landing', () => {
      const icbm = new ICBM(0, 200, 0, 200, GROUND_Y, 60);
      for (let i = 0; i < 100; i++) {
        icbm.update(0.1);
        if (icbm.hasLanded()) break;
      }

      const result = checkAllCollisions([icbm], [], cities, bases);
      expect(result.hitBases).toContain(0);
    });

    it('should handle multiple ICBMs in same explosion', () => {
      const icbm1 = new ICBM(0, 100, 100, 100, GROUND_Y, 60);
      const icbm2 = new ICBM(1, 105, 105, 105, GROUND_Y, 60);
      const explosion = new Explosion(0, 100, 100, 50);
      explosion.update(0.3);

      const result = checkAllCollisions([icbm1, icbm2], [explosion], cities, bases);
      expect(result.destroyedICBMs).toContain(0);
      expect(result.destroyedICBMs).toContain(1);
    });

    it('should check explosions before landing', () => {
      // ICBM heading toward city
      const icbm = new ICBM(0, 100, 100, 100, GROUND_Y, 60);
      // Explosion at its position
      const explosion = new Explosion(0, 100, 100, 50);
      explosion.update(0.3);

      const result = checkAllCollisions([icbm], [explosion], cities, bases);
      // ICBM destroyed by explosion, not by landing
      expect(result.destroyedICBMs).toContain(0);
      expect(result.hitCities).not.toContain(0);
    });

    it('should skip dead ICBMs', () => {
      const icbm = new ICBM(0, 100, 100, 100, GROUND_Y, 60);
      icbm.destroy();
      const explosion = new Explosion(0, 100, 100, 50);
      explosion.update(0.3);

      const result = checkAllCollisions([icbm], [explosion], cities, bases);
      expect(result.destroyedICBMs).not.toContain(0);
    });
  });
});
