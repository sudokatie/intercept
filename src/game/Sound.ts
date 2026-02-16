/**
 * Sound system for Intercept using Web Audio API.
 * Generates retro-style synthesized sounds.
 */

type SoundType =
  | 'launch'
  | 'explosion'
  | 'icbmDestroy'
  | 'cityDestroyed'
  | 'baseDestroyed'
  | 'waveComplete'
  | 'gameOver'
  | 'bonusCity';

class SoundSystem {
  private static instance: SoundSystem;
  private context: AudioContext | null = null;
  private enabled: boolean = true;
  private volume: number = 0.3;

  private constructor() {}

  static getInstance(): SoundSystem {
    if (!SoundSystem.instance) {
      SoundSystem.instance = new SoundSystem();
    }
    return SoundSystem.instance;
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.context) {
      try {
        this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch {
        return null;
      }
    }

    if (this.context.state === 'suspended') {
      this.context.resume();
    }

    return this.context;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  getVolume(): number {
    return this.volume;
  }

  resetContext(): void {
    this.context = null;
  }

  play(sound: SoundType): void {
    if (!this.enabled) return;

    const ctx = this.getContext();
    if (!ctx) return;

    switch (sound) {
      case 'launch':
        this.playLaunch(ctx);
        break;
      case 'explosion':
        this.playExplosion(ctx);
        break;
      case 'icbmDestroy':
        this.playIcbmDestroy(ctx);
        break;
      case 'cityDestroyed':
        this.playCityDestroyed(ctx);
        break;
      case 'baseDestroyed':
        this.playBaseDestroyed(ctx);
        break;
      case 'waveComplete':
        this.playWaveComplete(ctx);
        break;
      case 'gameOver':
        this.playGameOver(ctx);
        break;
      case 'bonusCity':
        this.playBonusCity(ctx);
        break;
    }
  }

  private playLaunch(ctx: AudioContext): void {
    // Rising whoosh
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(this.volume * 0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  }

  private playExplosion(ctx: AudioContext): void {
    // Big boom with noise
    const bufferSize = ctx.sampleRate * 0.3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      const t = i / bufferSize;
      const impact = Math.sin(2 * Math.PI * 40 * t) * Math.exp(-t * 10);
      const noise = (Math.random() * 2 - 1) * Math.exp(-t * 5);
      data[i] = (impact * 0.5 + noise * 0.5);
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(this.volume * 0.5, ctx.currentTime);

    source.connect(gain);
    gain.connect(ctx.destination);

    source.start(ctx.currentTime);
  }

  private playIcbmDestroy(ctx: AudioContext): void {
    // Pop + small explosion
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(this.volume * 0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
  }

  private playCityDestroyed(ctx: AudioContext): void {
    // Heavy impact + rumble
    const bufferSize = ctx.sampleRate * 0.4;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      const t = i / bufferSize;
      const impact = Math.sin(2 * Math.PI * 30 * t) * Math.exp(-t * 8);
      const rumble = Math.sin(2 * Math.PI * 20 * t * (1 - t)) * Math.exp(-t * 4);
      const noise = (Math.random() * 2 - 1) * Math.exp(-t * 6) * 0.3;
      data[i] = (impact * 0.4 + rumble * 0.4 + noise);
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(this.volume * 0.6, ctx.currentTime);

    source.connect(gain);
    gain.connect(ctx.destination);

    source.start(ctx.currentTime);
  }

  private playBaseDestroyed(ctx: AudioContext): void {
    // Explosion + metal clang
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.25);

    gain.gain.setValueAtTime(this.volume * 0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.25);
  }

  private playWaveComplete(ctx: AudioContext): void {
    // Victory fanfare
    const melody = [
      { freq: 523.25, time: 0, dur: 0.1 },
      { freq: 659.25, time: 0.1, dur: 0.1 },
      { freq: 783.99, time: 0.2, dur: 0.15 },
    ];

    melody.forEach(({ freq, time, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'square';
      osc.frequency.value = freq;

      const startTime = ctx.currentTime + time;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(this.volume * 0.25, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + dur);

      osc.start(startTime);
      osc.stop(startTime + dur);
    });
  }

  private playGameOver(ctx: AudioContext): void {
    // Sad descending tones
    const melody = [
      { freq: 392, time: 0, dur: 0.25 },
      { freq: 330, time: 0.25, dur: 0.25 },
      { freq: 262, time: 0.5, dur: 0.4 },
    ];

    melody.forEach(({ freq, time, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sawtooth';
      osc.frequency.value = freq;

      const startTime = ctx.currentTime + time;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(this.volume * 0.35, startTime + 0.03);
      gain.gain.setValueAtTime(this.volume * 0.35, startTime + dur - 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + dur);

      osc.start(startTime);
      osc.stop(startTime + dur);
    });
  }

  private playBonusCity(ctx: AudioContext): void {
    // Happy ascending chime
    const melody = [
      { freq: 523.25, time: 0, dur: 0.1 },
      { freq: 659.25, time: 0.08, dur: 0.1 },
      { freq: 783.99, time: 0.16, dur: 0.1 },
      { freq: 1046.50, time: 0.24, dur: 0.2 },
    ];

    melody.forEach(({ freq, time, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      osc.frequency.value = freq;

      const startTime = ctx.currentTime + time;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(this.volume * 0.3, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + dur);

      osc.start(startTime);
      osc.stop(startTime + dur);
    });
  }
}

export const Sound = SoundSystem.getInstance();
