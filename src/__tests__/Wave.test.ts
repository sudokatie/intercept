import { WaveManager } from '../game/Wave';
import { City } from '../game/City';
import { MissileBase } from '../game/MissileBase';
import {
  INITIAL_ICBM_COUNT,
  ICBM_COUNT_INCREMENT,
  MAX_ICBM_COUNT,
  INITIAL_ICBM_SPEED,
  ICBM_SPEED_INCREMENT,
  MAX_ICBM_SPEED,
  INITIAL_BASE_AMMO,
  WAVE_SPAWN_DURATION,
} from '../game/constants';

describe('WaveManager', () => {
  let waveManager: WaveManager;

  beforeEach(() => {
    waveManager = new WaveManager();
  });

  describe('constructor', () => {
    it('should start at wave 0', () => {
      expect(waveManager.currentWave).toBe(0);
    });
  });

  describe('generateWave', () => {
    it('should generate correct wave 1 config', () => {
      const wave = waveManager.generateWave(1);
      expect(wave.number).toBe(1);
      expect(wave.icbmCount).toBe(INITIAL_ICBM_COUNT);
      expect(wave.icbmSpeed).toBe(INITIAL_ICBM_SPEED);
      expect(wave.baseAmmo).toBe(INITIAL_BASE_AMMO);
    });

    it('should increase ICBM count per wave', () => {
      const wave2 = waveManager.generateWave(2);
      expect(wave2.icbmCount).toBe(INITIAL_ICBM_COUNT + ICBM_COUNT_INCREMENT);

      const wave3 = waveManager.generateWave(3);
      expect(wave3.icbmCount).toBe(INITIAL_ICBM_COUNT + 2 * ICBM_COUNT_INCREMENT);
    });

    it('should increase ICBM speed per wave', () => {
      const wave2 = waveManager.generateWave(2);
      expect(wave2.icbmSpeed).toBe(INITIAL_ICBM_SPEED + ICBM_SPEED_INCREMENT);

      const wave3 = waveManager.generateWave(3);
      expect(wave3.icbmSpeed).toBe(INITIAL_ICBM_SPEED + 2 * ICBM_SPEED_INCREMENT);
    });

    it('should cap ICBM count at maximum', () => {
      const wave100 = waveManager.generateWave(100);
      expect(wave100.icbmCount).toBe(MAX_ICBM_COUNT);
    });

    it('should cap ICBM speed at maximum', () => {
      const wave100 = waveManager.generateWave(100);
      expect(wave100.icbmSpeed).toBe(MAX_ICBM_SPEED);
    });
  });

  describe('createICBMs', () => {
    it('should create correct number of ICBMs', () => {
      const cities = [new City(0, 100), new City(1, 200)];
      const bases = [new MissileBase(0, 150)];
      const wave = waveManager.generateWave(1);

      const icbms = waveManager.createICBMs(wave, cities, bases);
      expect(icbms.length).toBe(wave.icbmCount);
    });

    it('should not create ICBMs if no valid targets', () => {
      const cities = [new City(0, 100)];
      cities[0].destroy();
      const bases = [new MissileBase(0, 150)];
      bases[0].destroy();
      const wave = waveManager.generateWave(1);

      const icbms = waveManager.createICBMs(wave, cities, bases);
      expect(icbms.length).toBe(0);
    });

    it('should target alive cities and bases', () => {
      const cities = [new City(0, 100), new City(1, 200)];
      const bases = [new MissileBase(0, 150)];
      cities[0].destroy();
      const wave = waveManager.generateWave(1);

      const icbms = waveManager.createICBMs(wave, cities, bases);
      
      // All ICBMs should target either city 1 (x=200) or base 0 (x=150)
      for (const icbm of icbms) {
        const targetX = icbm.target.x;
        expect([150, 200]).toContain(targetX);
      }
    });

    it('should create ICBMs with correct speed', () => {
      const cities = [new City(0, 100)];
      const bases: MissileBase[] = [];
      const wave = waveManager.generateWave(3);

      const icbms = waveManager.createICBMs(wave, cities, bases);
      
      // All ICBMs should have wave speed
      for (const icbm of icbms) {
        expect(icbm.speed).toBe(wave.icbmSpeed);
      }
    });

    it('should create ICBMs starting from top of screen', () => {
      const cities = [new City(0, 100)];
      const bases: MissileBase[] = [];
      const wave = waveManager.generateWave(1);

      const icbms = waveManager.createICBMs(wave, cities, bases);
      
      for (const icbm of icbms) {
        expect(icbm.start.y).toBe(0);
      }
    });
  });

  describe('getSpawnTimes', () => {
    it('should return empty array for 0 count', () => {
      const times = waveManager.getSpawnTimes(0);
      expect(times).toEqual([]);
    });

    it('should return [0] for 1 count', () => {
      const times = waveManager.getSpawnTimes(1);
      expect(times).toEqual([0]);
    });

    it('should stagger times across duration', () => {
      const times = waveManager.getSpawnTimes(5, 4);
      expect(times).toEqual([0, 1, 2, 3, 4]);
    });

    it('should use default duration if not specified', () => {
      const times = waveManager.getSpawnTimes(6);
      expect(times[0]).toBe(0);
      expect(times[times.length - 1]).toBe(WAVE_SPAWN_DURATION);
    });
  });

  describe('nextWave', () => {
    it('should increment wave number', () => {
      waveManager.nextWave();
      expect(waveManager.currentWave).toBe(1);

      waveManager.nextWave();
      expect(waveManager.currentWave).toBe(2);
    });

    it('should return wave data for new wave', () => {
      const wave = waveManager.nextWave();
      expect(wave.number).toBe(1);
    });
  });

  describe('reset', () => {
    it('should reset wave number to 0', () => {
      waveManager.nextWave();
      waveManager.nextWave();
      waveManager.reset();
      expect(waveManager.currentWave).toBe(0);
    });
  });
});
