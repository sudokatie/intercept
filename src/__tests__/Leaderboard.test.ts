/**
 * @jest-environment jsdom
 */

import { Leaderboard } from '../game/Leaderboard';

describe('Leaderboard', () => {
  beforeEach(() => {
    localStorage.clear();
    Leaderboard.resetCache();
  });

  describe('load', () => {
    it('should return empty array when no data', () => {
      expect(Leaderboard.load()).toEqual([]);
    });

    it('should load existing data', () => {
      const data = [{ name: 'Defender', score: 5000, wave: 5, citiesSaved: 3, completedAt: '2026-01-01' }];
      localStorage.setItem('intercept_leaderboard', JSON.stringify(data));
      Leaderboard.resetCache();
      expect(Leaderboard.load()[0].name).toBe('Defender');
    });
  });

  describe('recordScore', () => {
    it('should add new high score', () => {
      const rank = Leaderboard.recordScore('Commander', 10000, 8, 4);
      expect(rank).toBe(1);
      expect(Leaderboard.getTop()[0].score).toBe(10000);
      expect(Leaderboard.getTop()[0].wave).toBe(8);
    });

    it('should sort by score descending', () => {
      Leaderboard.recordScore('Rookie', 1000, 2, 1);
      Leaderboard.recordScore('Ace', 50000, 15, 6);
      Leaderboard.recordScore('Veteran', 15000, 7, 3);
      
      const top = Leaderboard.getTop();
      expect(top[0].name).toBe('Ace');
      expect(top[1].name).toBe('Veteran');
      expect(top[2].name).toBe('Rookie');
    });

    it('should limit to max entries', () => {
      for (let i = 0; i < 15; i++) {
        Leaderboard.recordScore(`Player${i}`, i * 1000, i, i % 6);
      }
      expect(Leaderboard.getTop().length).toBe(10);
    });

    it('should persist to localStorage', () => {
      Leaderboard.recordScore('Saved', 7500, 5, 2);
      const stored = JSON.parse(localStorage.getItem('intercept_leaderboard')!);
      expect(stored[0].name).toBe('Saved');
    });
  });

  describe('wouldRank', () => {
    it('should return true when not full', () => {
      expect(Leaderboard.wouldRank(100)).toBe(true);
    });

    it('should check against worst score when full', () => {
      for (let i = 0; i < 10; i++) {
        Leaderboard.recordScore(`P${i}`, 10000 + i * 1000, i, i);
      }
      expect(Leaderboard.wouldRank(25000)).toBe(true);
      expect(Leaderboard.wouldRank(5000)).toBe(false);
    });
  });

  describe('getBest', () => {
    it('should return best score', () => {
      Leaderboard.recordScore('Second', 8000, 4, 2);
      Leaderboard.recordScore('First', 20000, 10, 5);
      expect(Leaderboard.getBest()?.name).toBe('First');
    });

    it('should return null when empty', () => {
      expect(Leaderboard.getBest()).toBeNull();
    });
  });

  describe('clear', () => {
    it('should remove all entries', () => {
      Leaderboard.recordScore('Gone', 5000, 3, 2);
      Leaderboard.clear();
      expect(Leaderboard.getTop().length).toBe(0);
    });
  });
});
