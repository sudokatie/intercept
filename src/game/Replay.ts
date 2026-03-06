/**
 * A single recorded click with timestamp
 */
export interface ReplayFrame {
  time: number;  // ms since replay start
  x: number;     // click x position
  y: number;     // click y position
}

/**
 * Complete replay data for a game session
 */
export interface ReplayData {
  version: number;
  wave: number;        // Starting wave
  timestamp: number;   // Unix timestamp when recorded
  duration: number;    // Total replay duration in ms
  frames: ReplayFrame[];
  finalScore: number;
  finalWave: number;
  citiesSurvived: number;
  dailyMode: boolean;
}

/**
 * Replay recorder and player for Intercept
 */
export class Replay {
  private _frames: ReplayFrame[] = [];
  private _startTime: number = 0;
  private _isRecording: boolean = false;
  private _isPlaying: boolean = false;
  private _playbackIndex: number = 0;
  private _playbackStartTime: number = 0;
  private _wave: number = 1;
  private _dailyMode: boolean = false;

  /**
   * Start recording inputs
   */
  startRecording(wave: number = 1, dailyMode: boolean = false): void {
    this._frames = [];
    this._startTime = Date.now();
    this._isRecording = true;
    this._isPlaying = false;
    this._wave = wave;
    this._dailyMode = dailyMode;
  }

  /**
   * Record a click input with current timestamp
   */
  recordClick(x: number, y: number): void {
    if (!this._isRecording) return;
    
    this._frames.push({
      time: Date.now() - this._startTime,
      x: Math.round(x),
      y: Math.round(y),
    });
  }

  /**
   * Stop recording and return the replay data
   */
  stopRecording(finalScore: number, finalWave: number, citiesSurvived: number): ReplayData {
    this._isRecording = false;
    
    return {
      version: 1,
      wave: this._wave,
      timestamp: this._startTime,
      duration: Date.now() - this._startTime,
      frames: [...this._frames],
      finalScore,
      finalWave,
      citiesSurvived,
      dailyMode: this._dailyMode,
    };
  }

  /**
   * Check if currently recording
   */
  get isRecording(): boolean {
    return this._isRecording;
  }

  /**
   * Start playback of a replay
   */
  startPlayback(data: ReplayData): void {
    this._frames = [...data.frames];
    this._playbackIndex = 0;
    this._playbackStartTime = Date.now();
    this._isPlaying = true;
    this._isRecording = false;
    this._wave = data.wave;
    this._dailyMode = data.dailyMode;
  }

  /**
   * Get next click if its time has come
   * Returns null if no click ready or playback complete
   */
  getNextClick(): { x: number; y: number } | null {
    if (!this._isPlaying || this._playbackIndex >= this._frames.length) {
      return null;
    }

    const elapsed = Date.now() - this._playbackStartTime;
    const frame = this._frames[this._playbackIndex];

    if (elapsed >= frame.time) {
      this._playbackIndex++;
      return { x: frame.x, y: frame.y };
    }

    return null;
  }

  /**
   * Check if playback is complete
   */
  get isPlaybackComplete(): boolean {
    return this._isPlaying && this._playbackIndex >= this._frames.length;
  }

  /**
   * Check if currently playing back
   */
  get isPlaying(): boolean {
    return this._isPlaying;
  }

  /**
   * Stop playback
   */
  stopPlayback(): void {
    this._isPlaying = false;
    this._playbackIndex = 0;
  }

  /**
   * Get playback progress (0-1)
   */
  get playbackProgress(): number {
    if (!this._isPlaying || this._frames.length === 0) return 0;
    return this._playbackIndex / this._frames.length;
  }

  /**
   * Get starting wave for current replay
   */
  get wave(): number {
    return this._wave;
  }

  /**
   * Get daily mode flag for current replay
   */
  get dailyMode(): boolean {
    return this._dailyMode;
  }

  /**
   * Encode replay data to a shareable string
   * Format: version|wave|timestamp|duration|score|finalWave|cities|daily|frames
   * Frames: time,x,y;time,x,y;...
   */
  static encode(data: ReplayData): string {
    const framesStr = data.frames
      .map(f => `${f.time},${f.x},${f.y}`)
      .join(';');
    
    const parts = [
      data.version,
      data.wave,
      data.timestamp,
      data.duration,
      data.finalScore,
      data.finalWave,
      data.citiesSurvived,
      data.dailyMode ? 1 : 0,
      framesStr,
    ];
    
    return btoa(parts.join('|'));
  }

  /**
   * Decode a replay string back to ReplayData
   */
  static decode(encoded: string): ReplayData | null {
    try {
      const decoded = atob(encoded);
      const parts = decoded.split('|');
      
      if (parts.length < 9) return null;
      
      const [version, wave, timestamp, duration, score, finalWave, cities, daily, framesStr] = parts;
      
      const frames: ReplayFrame[] = framesStr
        .split(';')
        .filter(f => f.length > 0)
        .map(f => {
          const [time, x, y] = f.split(',').map(Number);
          if (isNaN(time) || isNaN(x) || isNaN(y)) return null;
          return { time, x, y };
        })
        .filter((f): f is ReplayFrame => f !== null);
      
      return {
        version: parseInt(version, 10),
        wave: parseInt(wave, 10),
        timestamp: parseInt(timestamp, 10),
        duration: parseInt(duration, 10),
        frames,
        finalScore: parseInt(score, 10),
        finalWave: parseInt(finalWave, 10),
        citiesSurvived: parseInt(cities, 10),
        dailyMode: daily === '1',
      };
    } catch {
      return null;
    }
  }

  /**
   * Get replay statistics
   */
  static getStats(data: ReplayData): {
    totalShots: number;
    shotsPerSecond: number;
    durationSeconds: number;
    avgShotInterval: number;
  } {
    const durationSec = data.duration / 1000;
    
    let totalInterval = 0;
    for (let i = 1; i < data.frames.length; i++) {
      totalInterval += data.frames[i].time - data.frames[i - 1].time;
    }
    const avgInterval = data.frames.length > 1 
      ? totalInterval / (data.frames.length - 1) 
      : 0;
    
    return {
      totalShots: data.frames.length,
      shotsPerSecond: durationSec > 0 ? data.frames.length / durationSec : 0,
      durationSeconds: durationSec,
      avgShotInterval: avgInterval,
    };
  }

  /**
   * Generate share code for a replay
   */
  static generateShareCode(data: ReplayData): string {
    const dateStr = new Date(data.timestamp).toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = data.dailyMode ? 'INTERCEPT-D' : 'INTERCEPT';
    return `${prefix}-${dateStr}-${data.finalScore}-W${data.finalWave}`;
  }
}
