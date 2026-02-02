import { CollisionResult } from './types';
import { ICBM } from './ICBM';
import { Explosion } from './Explosion';
import { City } from './City';
import { MissileBase } from './MissileBase';
import { HIT_RADIUS, GROUND_Y } from './constants';

// Check if an ICBM is inside an explosion
export function icbmInExplosion(icbm: ICBM, explosion: Explosion): boolean {
  if (!icbm.alive) return false;
  return explosion.containsPoint(icbm.x, icbm.y);
}

// Find which asset (city or base) an ICBM hit when landing
export function findHitAsset(
  x: number,
  cities: City[],
  bases: MissileBase[]
): City | MissileBase | null {
  // Check cities first
  for (const city of cities) {
    if (city.alive) {
      const dist = Math.abs(x - city.x);
      if (dist <= HIT_RADIUS) {
        return city;
      }
    }
  }

  // Check bases
  for (const base of bases) {
    if (base.alive) {
      const dist = Math.abs(x - base.x);
      if (dist <= HIT_RADIUS) {
        return base;
      }
    }
  }

  return null;
}

// Check all collisions in a single pass
export function checkAllCollisions(
  icbms: ICBM[],
  explosions: Explosion[],
  cities: City[],
  bases: MissileBase[]
): CollisionResult {
  const result: CollisionResult = {
    destroyedICBMs: [],
    hitCities: [],
    hitBases: [],
  };

  for (const icbm of icbms) {
    if (!icbm.alive) continue;

    // Check explosion collisions first
    let destroyed = false;
    for (const explosion of explosions) {
      if (icbmInExplosion(icbm, explosion)) {
        result.destroyedICBMs.push(icbm.id);
        destroyed = true;
        break;
      }
    }

    if (destroyed) continue;

    // Check if ICBM has landed
    if (icbm.hasLanded()) {
      const hitAsset = findHitAsset(icbm.targetX, cities, bases);
      
      if (hitAsset) {
        if ('ammo' in hitAsset) {
          // It's a MissileBase
          result.hitBases.push(hitAsset.id);
        } else {
          // It's a City
          result.hitCities.push(hitAsset.id);
        }
      }
      
      // ICBM explodes on landing regardless of hit
      result.destroyedICBMs.push(icbm.id);
    }
  }

  return result;
}
