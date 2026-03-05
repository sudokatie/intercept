/**
 * Tests for the Achievement system
 */

import {
  ACHIEVEMENTS,
  AchievementManager,
  getAchievementManager,
} from '../game/Achievements';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(global, 'localStorage', { value: localStorageMock });

describe('Achievements', () => {
  let manager: AchievementManager;

  beforeEach(() => {
    localStorageMock.clear();
    manager = new AchievementManager();
  });

  describe('ACHIEVEMENTS constant', () => {
    it('contains at least 20 achievements', () => {
      expect(ACHIEVEMENTS.length).toBeGreaterThanOrEqual(20);
    });

    it('has unique ids for all achievements', () => {
      const ids = ACHIEVEMENTS.map((a) => a.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('has all required fields for each achievement', () => {
      for (const achievement of ACHIEVEMENTS) {
        expect(achievement.id).toBeDefined();
        expect(achievement.name).toBeDefined();
        expect(achievement.description).toBeDefined();
        expect(achievement.icon).toBeDefined();
        expect(achievement.category).toBeDefined();
        expect(['skill', 'exploration', 'mastery', 'daily']).toContain(
          achievement.category
        );
      }
    });

    it('includes Intercept-specific achievements', () => {
      const ids = ACHIEVEMENTS.map((a) => a.id);
      expect(ids).toContain('first_intercept');
      expect(ids).toContain('multi_kill');
      expect(ids).toContain('perfect_wave');
    });
  });

  describe('AchievementManager', () => {
    it('starts with no achievements unlocked', () => {
      expect(manager.getUnlockedCount()).toBe(0);
    });

    it('returns total achievement count', () => {
      expect(manager.getTotalCount()).toBe(ACHIEVEMENTS.length);
    });

    it('can unlock an achievement', () => {
      const result = manager.unlock('first_intercept');
      expect(result).not.toBeNull();
      expect(result?.id).toBe('first_intercept');
      expect(manager.isUnlocked('first_intercept')).toBe(true);
    });

    it('returns null when unlocking already unlocked', () => {
      manager.unlock('first_intercept');
      const result = manager.unlock('first_intercept');
      expect(result).toBeNull();
    });

    it('persists achievements to localStorage', () => {
      manager.unlock('first_intercept');
      const manager2 = new AchievementManager();
      expect(manager2.isUnlocked('first_intercept')).toBe(true);
    });

    it('can reset all progress', () => {
      manager.unlock('first_intercept');
      manager.unlock('wave_cleared');
      manager.reset();
      expect(manager.getUnlockedCount()).toBe(0);
    });
  });

  describe('Daily achievements', () => {
    it('records daily completion', () => {
      const results = manager.recordDailyCompletion(5);
      expect(results.some((a) => a.id === 'daily_complete')).toBe(true);
    });

    it('unlocks rank achievements appropriately', () => {
      const results = manager.recordDailyCompletion(1);
      expect(results.some((a) => a.id === 'daily_first')).toBe(true);
      expect(results.some((a) => a.id === 'daily_top_3')).toBe(true);
      expect(results.some((a) => a.id === 'daily_top_10')).toBe(true);
    });
  });
});
