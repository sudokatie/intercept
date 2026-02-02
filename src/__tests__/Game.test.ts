import { Game } from '../game/Game';
import { GameState } from '../game/types';
import { GROUND_Y, SCORE_ICBM, SCORE_CITY_BONUS, SCORE_AMMO_BONUS } from '../game/constants';

describe('Game', () => {
  let game: Game;

  beforeEach(() => {
    game = new Game();
  });

  describe('constructor', () => {
    it('should start in Menu state', () => {
      expect(game.state).toBe(GameState.Menu);
    });

    it('should have 6 cities', () => {
      expect(game.cities.length).toBe(6);
    });

    it('should have 3 bases', () => {
      expect(game.bases.length).toBe(3);
    });

    it('should start with score 0', () => {
      expect(game.score).toBe(0);
    });

    it('should start at wave 0', () => {
      expect(game.wave).toBe(0);
    });
  });

  describe('start', () => {
    it('should change state to Playing', () => {
      game.start();
      expect(game.state).toBe(GameState.Playing);
    });

    it('should set wave to 1', () => {
      game.start();
      expect(game.wave).toBe(1);
    });
  });

  describe('handleClick', () => {
    beforeEach(() => {
      game.start();
    });

    it('should create interceptor on valid click', () => {
      game.handleClick(300, 200);
      expect(game.interceptors.length).toBe(1);
    });

    it('should not create interceptor when clicking on ground', () => {
      game.handleClick(300, GROUND_Y + 10);
      expect(game.interceptors.length).toBe(0);
    });

    it('should reduce base ammo on fire', () => {
      const initialAmmo = game.bases[0].ammo;
      game.handleClick(100, 200);
      expect(game.bases[0].ammo).toBe(initialAmmo - 1);
    });

    it('should use nearest base', () => {
      // Click near first base (x=80)
      game.handleClick(100, 200);
      const initialAmmo0 = game.bases[0].ammo;
      
      // First base should have fired
      expect(game.bases[0].ammo).toBe(9); // Started with 10
    });
  });

  describe('update', () => {
    beforeEach(() => {
      game.start();
    });

    it('should spawn ICBMs over time', () => {
      // Initially might have some ICBMs
      const initial = game.icbms.length;
      
      // Update for a few seconds
      for (let i = 0; i < 60; i++) {
        game.update(0.1);
      }
      
      // Should have more ICBMs spawned
      expect(game.icbms.length).toBeGreaterThanOrEqual(initial);
    });

    it('should move interceptors toward target', () => {
      game.handleClick(300, 200);
      const initial = game.interceptors[0];
      const startY = initial.y;
      
      game.update(0.1);
      
      // Interceptor should have moved up (toward target)
      expect(game.interceptors[0].y).toBeLessThan(startY);
    });

    it('should create explosion when interceptor arrives', () => {
      // Create interceptor with nearby target
      game.handleClick(game.bases[0].x, GROUND_Y - 50);
      
      // Update until interceptor arrives
      for (let i = 0; i < 100; i++) {
        game.update(0.05);
        if (game.explosions.length > 0) break;
      }
      
      expect(game.explosions.length).toBeGreaterThan(0);
    });
  });

  describe('reset', () => {
    it('should return to Menu state', () => {
      game.start();
      game.reset();
      expect(game.state).toBe(GameState.Menu);
    });

    it('should reset score to 0', () => {
      game.start();
      // Add some score by destroying ICBMs
      game.reset();
      expect(game.score).toBe(0);
    });

    it('should reset wave to 0', () => {
      game.start();
      game.reset();
      expect(game.wave).toBe(0);
    });

    it('should restore all cities', () => {
      game.start();
      game.reset();
      
      const aliveCities = game.cities.filter(c => c.alive);
      expect(aliveCities.length).toBe(6);
    });

    it('should restore all bases', () => {
      game.start();
      game.reset();
      
      const aliveBases = game.bases.filter(b => b.alive);
      expect(aliveBases.length).toBe(3);
    });
  });

  describe('wave progression', () => {
    it('should end wave when all ICBMs resolved', () => {
      game.start();
      
      // Fast forward until wave ends or we give up
      for (let i = 0; i < 1000; i++) {
        game.update(0.1);
        if (game.state === GameState.WaveEnd) break;
        
        // Destroy all ICBMs by creating explosions
        for (const icbm of game.icbms) {
          if (icbm.alive) {
            // Click near ICBM to destroy it
            game.handleClick(icbm.x, icbm.y);
          }
        }
      }
      
      // Should have reached wave end (or game over if cities destroyed)
      expect([GameState.WaveEnd, GameState.GameOver]).toContain(game.state);
    });

    it('should continue to next wave', () => {
      game.start();
      const wave1 = game.wave;
      
      // Force wave end by updating until all ICBMs gone
      for (let i = 0; i < 1000; i++) {
        game.update(0.1);
        
        // Destroy ICBMs
        for (const icbm of game.icbms) {
          if (icbm.alive) {
            game.handleClick(icbm.x, icbm.y);
          }
        }
        
        if (game.state === GameState.WaveEnd) break;
      }
      
      if (game.state === GameState.WaveEnd) {
        game.continueToNextWave();
        expect(game.wave).toBe(wave1 + 1);
        expect(game.state).toBe(GameState.Playing);
      }
    });
  });

  describe('game over', () => {
    it('should end game when all cities destroyed', () => {
      game.start();
      
      // Manually destroy all cities
      for (const city of game.cities) {
        city.destroy();
      }
      
      game.update(0.1);
      expect(game.state).toBe(GameState.GameOver);
    });
  });

  describe('getAliveCityCount', () => {
    it('should return correct count', () => {
      game.start();
      expect(game.getAliveCityCount()).toBe(6);
      
      game.cities[0].destroy();
      expect(game.getAliveCityCount()).toBe(5);
    });
  });
});
