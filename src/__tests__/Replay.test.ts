import { Replay, ReplayData } from '../game/Replay';

describe('Replay', () => {
  describe('recording', () => {
    it('should start recording', () => {
      const replay = new Replay();
      replay.startRecording(1, false);
      expect(replay.isRecording).toBe(true);
      expect(replay.isPlaying).toBe(false);
    });

    it('should record clicks with timestamps', () => {
      const replay = new Replay();
      replay.startRecording(1, false);
      
      replay.recordClick(100, 200);
      replay.recordClick(300, 150);
      replay.recordClick(250, 180);
      
      const data = replay.stopRecording(1000, 3, 4);
      expect(data.frames.length).toBe(3);
      expect(data.frames[0].x).toBe(100);
      expect(data.frames[0].y).toBe(200);
      expect(data.frames[1].x).toBe(300);
      expect(data.frames[1].y).toBe(150);
    });

    it('should stop recording and return data', () => {
      const replay = new Replay();
      replay.startRecording(1, false);
      replay.recordClick(100, 200);
      
      const data = replay.stopRecording(5000, 5, 3);
      
      expect(replay.isRecording).toBe(false);
      expect(data.version).toBe(1);
      expect(data.wave).toBe(1);
      expect(data.finalScore).toBe(5000);
      expect(data.finalWave).toBe(5);
      expect(data.citiesSurvived).toBe(3);
      expect(data.dailyMode).toBe(false);
    });

    it('should record daily mode flag', () => {
      const replay = new Replay();
      replay.startRecording(1, true);
      
      const data = replay.stopRecording(100, 1, 6);
      expect(data.dailyMode).toBe(true);
    });

    it('should not record when not recording', () => {
      const replay = new Replay();
      // Not started recording
      replay.recordClick(100, 200);
      
      replay.startRecording(1, false);
      replay.recordClick(150, 250);
      replay.stopRecording(0, 1, 0);
      
      // Recording stopped
      replay.recordClick(200, 300);
      
      replay.startRecording(1, false);
      const data = replay.stopRecording(0, 1, 0);
      expect(data.frames.length).toBe(0);
    });

    it('should round click positions', () => {
      const replay = new Replay();
      replay.startRecording(1, false);
      replay.recordClick(100.7, 200.3);
      
      const data = replay.stopRecording(0, 1, 0);
      expect(data.frames[0].x).toBe(101);
      expect(data.frames[0].y).toBe(200);
    });
  });

  describe('playback', () => {
    it('should start playback', () => {
      const replay = new Replay();
      const data: ReplayData = {
        version: 1,
        wave: 1,
        timestamp: Date.now(),
        duration: 1000,
        frames: [
          { time: 0, x: 100, y: 200 },
          { time: 100, x: 300, y: 150 },
        ],
        finalScore: 1000,
        finalWave: 2,
        citiesSurvived: 5,
        dailyMode: false,
      };
      
      replay.startPlayback(data);
      expect(replay.isPlaying).toBe(true);
      expect(replay.isRecording).toBe(false);
    });

    it('should return clicks at correct times', async () => {
      const replay = new Replay();
      const data: ReplayData = {
        version: 1,
        wave: 1,
        timestamp: Date.now(),
        duration: 200,
        frames: [
          { time: 0, x: 100, y: 200 },
          { time: 50, x: 300, y: 150 },
        ],
        finalScore: 1000,
        finalWave: 1,
        citiesSurvived: 6,
        dailyMode: false,
      };
      
      replay.startPlayback(data);
      
      // First frame should be available immediately
      const first = replay.getNextClick();
      expect(first).toEqual({ x: 100, y: 200 });
      
      // Wait for second frame
      await new Promise(r => setTimeout(r, 60));
      const second = replay.getNextClick();
      expect(second).toEqual({ x: 300, y: 150 });
    });

    it('should track playback progress', () => {
      const replay = new Replay();
      const data: ReplayData = {
        version: 1,
        wave: 1,
        timestamp: Date.now(),
        duration: 100,
        frames: [
          { time: 0, x: 100, y: 200 },
          { time: 10, x: 200, y: 300 },
        ],
        finalScore: 500,
        finalWave: 1,
        citiesSurvived: 4,
        dailyMode: false,
      };
      
      replay.startPlayback(data);
      expect(replay.playbackProgress).toBe(0);
      
      // Get first frame
      replay.getNextClick();
      expect(replay.playbackProgress).toBe(0.5);
    });

    it('should report playback complete', () => {
      const replay = new Replay();
      const data: ReplayData = {
        version: 1,
        wave: 1,
        timestamp: Date.now(),
        duration: 50,
        frames: [
          { time: 0, x: 100, y: 200 },
        ],
        finalScore: 100,
        finalWave: 1,
        citiesSurvived: 6,
        dailyMode: false,
      };
      
      replay.startPlayback(data);
      expect(replay.isPlaybackComplete).toBe(false);
      
      replay.getNextClick();
      expect(replay.isPlaybackComplete).toBe(true);
    });

    it('should stop playback', () => {
      const replay = new Replay();
      const data: ReplayData = {
        version: 1,
        wave: 1,
        timestamp: Date.now(),
        duration: 100,
        frames: [{ time: 0, x: 100, y: 200 }],
        finalScore: 100,
        finalWave: 1,
        citiesSurvived: 5,
        dailyMode: false,
      };
      
      replay.startPlayback(data);
      replay.stopPlayback();
      
      expect(replay.isPlaying).toBe(false);
    });
  });

  describe('encode/decode', () => {
    it('should encode replay data to string', () => {
      const data: ReplayData = {
        version: 1,
        wave: 1,
        timestamp: 1709740800000,
        duration: 5000,
        frames: [
          { time: 0, x: 100, y: 200 },
          { time: 500, x: 300, y: 150 },
        ],
        finalScore: 10000,
        finalWave: 5,
        citiesSurvived: 4,
        dailyMode: false,
      };
      
      const encoded = Replay.encode(data);
      expect(typeof encoded).toBe('string');
      expect(encoded.length).toBeGreaterThan(0);
    });

    it('should decode replay string back to data', () => {
      const original: ReplayData = {
        version: 1,
        wave: 1,
        timestamp: 1709740800000,
        duration: 5000,
        frames: [
          { time: 0, x: 100, y: 200 },
          { time: 500, x: 300, y: 150 },
          { time: 1000, x: 400, y: 100 },
        ],
        finalScore: 10000,
        finalWave: 5,
        citiesSurvived: 4,
        dailyMode: false,
      };
      
      const encoded = Replay.encode(original);
      const decoded = Replay.decode(encoded);
      
      expect(decoded).not.toBeNull();
      expect(decoded!.version).toBe(original.version);
      expect(decoded!.wave).toBe(original.wave);
      expect(decoded!.timestamp).toBe(original.timestamp);
      expect(decoded!.duration).toBe(original.duration);
      expect(decoded!.finalScore).toBe(original.finalScore);
      expect(decoded!.finalWave).toBe(original.finalWave);
      expect(decoded!.citiesSurvived).toBe(original.citiesSurvived);
      expect(decoded!.dailyMode).toBe(original.dailyMode);
      expect(decoded!.frames.length).toBe(original.frames.length);
      expect(decoded!.frames[0]).toEqual({ time: 0, x: 100, y: 200 });
    });

    it('should handle empty frames', () => {
      const data: ReplayData = {
        version: 1,
        wave: 1,
        timestamp: 1709740800000,
        duration: 0,
        frames: [],
        finalScore: 0,
        finalWave: 1,
        citiesSurvived: 6,
        dailyMode: false,
      };
      
      const encoded = Replay.encode(data);
      const decoded = Replay.decode(encoded);
      
      expect(decoded).not.toBeNull();
      expect(decoded!.frames.length).toBe(0);
    });

    it('should handle daily mode flag', () => {
      const data: ReplayData = {
        version: 1,
        wave: 1,
        timestamp: 1709740800000,
        duration: 100,
        frames: [{ time: 0, x: 200, y: 300 }],
        finalScore: 5000,
        finalWave: 3,
        citiesSurvived: 5,
        dailyMode: true,
      };
      
      const encoded = Replay.encode(data);
      const decoded = Replay.decode(encoded);
      
      expect(decoded!.dailyMode).toBe(true);
    });

    it('should return null for invalid encoded string', () => {
      expect(Replay.decode('invalid')).toBeNull();
      expect(Replay.decode('')).toBeNull();
      expect(Replay.decode('!!!')).toBeNull();
    });
  });

  describe('getStats', () => {
    it('should calculate replay statistics', () => {
      const data: ReplayData = {
        version: 1,
        wave: 1,
        timestamp: Date.now(),
        duration: 10000, // 10 seconds
        frames: [
          { time: 0, x: 100, y: 200 },
          { time: 1000, x: 200, y: 300 },
          { time: 3000, x: 300, y: 400 },
          { time: 4000, x: 400, y: 500 },
          { time: 8000, x: 500, y: 100 },
        ],
        finalScore: 5000,
        finalWave: 3,
        citiesSurvived: 4,
        dailyMode: false,
      };
      
      const stats = Replay.getStats(data);
      
      expect(stats.totalShots).toBe(5);
      expect(stats.shotsPerSecond).toBe(0.5);
      expect(stats.durationSeconds).toBe(10);
      expect(stats.avgShotInterval).toBe(2000); // (1000+2000+1000+4000)/4
    });

    it('should handle zero duration', () => {
      const data: ReplayData = {
        version: 1,
        wave: 1,
        timestamp: Date.now(),
        duration: 0,
        frames: [],
        finalScore: 0,
        finalWave: 1,
        citiesSurvived: 6,
        dailyMode: false,
      };
      
      const stats = Replay.getStats(data);
      
      expect(stats.totalShots).toBe(0);
      expect(stats.shotsPerSecond).toBe(0);
      expect(stats.avgShotInterval).toBe(0);
    });

    it('should handle single shot', () => {
      const data: ReplayData = {
        version: 1,
        wave: 1,
        timestamp: Date.now(),
        duration: 5000,
        frames: [{ time: 0, x: 100, y: 200 }],
        finalScore: 100,
        finalWave: 1,
        citiesSurvived: 6,
        dailyMode: false,
      };
      
      const stats = Replay.getStats(data);
      
      expect(stats.totalShots).toBe(1);
      expect(stats.avgShotInterval).toBe(0); // No interval with single shot
    });
  });

  describe('generateShareCode', () => {
    it('should generate share code for regular replay', () => {
      const data: ReplayData = {
        version: 1,
        wave: 1,
        timestamp: new Date('2026-03-06').getTime(),
        duration: 60000,
        frames: [],
        finalScore: 25000,
        finalWave: 8,
        citiesSurvived: 3,
        dailyMode: false,
      };
      
      const code = Replay.generateShareCode(data);
      expect(code).toMatch(/^INTERCEPT-\d{8}-25000-W8$/);
    });

    it('should generate share code for daily replay', () => {
      const data: ReplayData = {
        version: 1,
        wave: 1,
        timestamp: new Date('2026-03-06').getTime(),
        duration: 45000,
        frames: [],
        finalScore: 15000,
        finalWave: 5,
        citiesSurvived: 4,
        dailyMode: true,
      };
      
      const code = Replay.generateShareCode(data);
      expect(code).toMatch(/^INTERCEPT-D-\d{8}-15000-W5$/);
    });
  });
});
