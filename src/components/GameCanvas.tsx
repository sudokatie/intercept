'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { Game } from '@/game/Game';
import { Renderer } from '@/game/Renderer';
import { Input } from '@/game/Input';
import { GameState } from '@/game/types';
import type { ReplayData } from '@/game/Replay';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  CANVAS_SCALE,
  DISPLAY_WIDTH,
  DISPLAY_HEIGHT,
} from '@/game/constants';
import { TitleScreen } from './TitleScreen';
import { GameOver } from './GameOver';
import { ReplayView } from './ReplayView';
import { ReplayImport } from './ReplayImport';
import { Music } from '@/game/Music';

export function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game | null>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const inputRef = useRef<Input | null>(null);
  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  const [gameState, setGameState] = useState<GameState>(GameState.Menu);
  const [score, setScore] = useState(0);
  const [wave, setWave] = useState(1);
  const [cities, setCities] = useState(6);
  const [showReplayView, setShowReplayView] = useState(false);
  const [showReplayImport, setShowReplayImport] = useState(false);
  const [currentReplayData, setCurrentReplayData] = useState<ReplayData | null>(null);

  // Game loop
  const loop = useCallback((timestamp: number) => {
    if (!gameRef.current || !rendererRef.current) return;

    const dt = lastTimeRef.current ? (timestamp - lastTimeRef.current) / 1000 : 0;
    lastTimeRef.current = timestamp;

    // Cap delta time to prevent huge jumps
    const cappedDt = Math.min(dt, 0.1);

    // Update game state
    gameRef.current.update(cappedDt);

    // Sync React state
    const game = gameRef.current;
    setGameState(game.state);
    setScore(game.score);
    setWave(game.wave);
    setCities(game.getAliveCityCount());

    // Render
    rendererRef.current.render(
      game.cities,
      game.bases,
      game.interceptors,
      game.icbms,
      game.explosions,
      game.particles,
      game.score,
      game.wave
    );

    animationRef.current = requestAnimationFrame(loop);
  }, []);

  // Initialize game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Scale for retina
    ctx.scale(CANVAS_SCALE, CANVAS_SCALE);

    // Create game objects
    gameRef.current = new Game();
    rendererRef.current = new Renderer(ctx);
    inputRef.current = new Input();

    // Attach input
    inputRef.current.attach(canvas, (x, y) => {
      if (gameRef.current) {
        gameRef.current.handleClick(x, y);
      }
    });

    // Start loop
    animationRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationRef.current);
      inputRef.current?.detach();
    };
  }, [loop]);

  // Handle wave end - auto continue after delay
  useEffect(() => {
    if (gameState === GameState.WaveEnd) {
      const timer = setTimeout(() => {
        gameRef.current?.continueToNextWave();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [gameState]);

  // Switch music tracks based on game state
  useEffect(() => {
    switch (gameState) {
      case GameState.Menu:
        Music.play('menu');
        break;
      case GameState.Playing:
        Music.play('gameplay');
        break;
      case GameState.WaveEnd:
        Music.play('victory');
        break;
      case GameState.GameOver:
        Music.play('gameover');
        break;
    }
  }, [gameState]);

  const handleStart = useCallback(() => {
    gameRef.current?.start();
  }, []);

  const handleStartDaily = useCallback(() => {
    gameRef.current?.startDaily();
  }, []);

  const handleRestart = useCallback(() => {
    gameRef.current?.reset();
    gameRef.current?.start();
  }, []);

  // Replay handlers
  const handleShowReplayView = useCallback(() => {
    const data = gameRef.current?.getLastReplayData();
    if (data) {
      setCurrentReplayData(data);
      setShowReplayView(true);
    }
  }, []);

  const handleCloseReplayView = useCallback(() => {
    setShowReplayView(false);
    setCurrentReplayData(null);
  }, []);

  const handleOpenReplayImport = useCallback(() => {
    setShowReplayImport(true);
  }, []);

  const handleCloseReplayImport = useCallback(() => {
    setShowReplayImport(false);
  }, []);

  const handleImportReplay = useCallback((data: ReplayData) => {
    setShowReplayImport(false);
    gameRef.current?.startPlayback(data);
  }, []);

  const handleWatchReplayFromView = useCallback(() => {
    if (currentReplayData) {
      setShowReplayView(false);
      gameRef.current?.startPlayback(currentReplayData);
    }
  }, [currentReplayData]);

  return (
    <div className="relative inline-block">
      <canvas
        ref={canvasRef}
        width={DISPLAY_WIDTH}
        height={DISPLAY_HEIGHT}
        className="block"
        style={{
          width: CANVAS_WIDTH,
          height: CANVAS_HEIGHT,
          imageRendering: 'pixelated',
        }}
      />

      {gameState === GameState.Menu && (
        <TitleScreen
          onStart={handleStart}
          onStartDaily={handleStartDaily}
          onWatchReplay={handleOpenReplayImport}
        />
      )}

      {gameState === GameState.GameOver && (
        <GameOver
          score={score}
          wave={wave}
          onRestart={handleRestart}
          dailyMode={gameRef.current?.isDailyMode() ?? false}
          hasReplay={gameRef.current?.getLastReplayData() !== null}
          onShareReplay={handleShowReplayView}
        />
      )}

      {gameState === GameState.WaveEnd && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-3xl font-bold text-cyan-400 animate-pulse">
            WAVE {wave} COMPLETE
          </div>
        </div>
      )}

      {/* Replay playback progress bar */}
      {gameRef.current?.isPlaybackMode() && (
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            left: '10px',
            right: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <div
            style={{
              flex: 1,
              height: '8px',
              backgroundColor: '#333',
              borderRadius: '4px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${(gameRef.current?.getPlaybackProgress() ?? 0) * 100}%`,
                height: '100%',
                backgroundColor: '#3b82f6',
                transition: 'width 0.1s',
              }}
            />
          </div>
          <button
            onClick={() => gameRef.current?.stopPlayback()}
            style={{
              backgroundColor: '#ef4444',
              color: '#fff',
              border: 'none',
              padding: '4px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            STOP
          </button>
        </div>
      )}

      {/* Replay View Modal */}
      {showReplayView && currentReplayData && (
        <ReplayView
          data={currentReplayData}
          onClose={handleCloseReplayView}
          onWatch={handleWatchReplayFromView}
        />
      )}

      {/* Replay Import Modal */}
      {showReplayImport && (
        <ReplayImport
          onImport={handleImportReplay}
          onClose={handleCloseReplayImport}
        />
      )}
    </div>
  );
}
