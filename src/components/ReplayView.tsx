'use client';

import { useState } from 'react';
import { Replay, ReplayData } from '../game/Replay';

interface ReplayViewProps {
  data: ReplayData;
  onClose: () => void;
  onWatch?: () => void;
}

export function ReplayView({ data, onClose, onWatch }: ReplayViewProps) {
  const [copied, setCopied] = useState(false);
  const stats = Replay.getStats(data);
  const shareCode = Replay.generateShareCode(data);
  const encodedReplay = Replay.encode(data);

  const copyShareCode = () => {
    navigator.clipboard.writeText(shareCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyReplayCode = () => {
    navigator.clipboard.writeText(encodedReplay);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: '#1a1a2e',
          border: '3px solid #ef4444',
          borderRadius: '8px',
          padding: '24px',
          maxWidth: '400px',
          width: '90%',
          color: '#e0e0e0',
        }}
      >
        <h2
          style={{
            color: '#ef4444',
            textAlign: 'center',
            marginTop: 0,
            marginBottom: '16px',
            fontSize: '24px',
          }}
        >
          REPLAY SAVED
        </h2>

        <div
          style={{
            backgroundColor: '#0d0d1a',
            borderRadius: '4px',
            padding: '12px',
            marginBottom: '16px',
          }}
        >
          <div style={{ marginBottom: '8px' }}>
            <span style={{ color: '#888' }}>Score: </span>
            <span style={{ color: '#fff', fontWeight: 'bold' }}>{data.finalScore.toLocaleString()}</span>
          </div>
          <div style={{ marginBottom: '8px' }}>
            <span style={{ color: '#888' }}>Wave: </span>
            <span style={{ color: '#fff' }}>{data.finalWave}</span>
          </div>
          <div style={{ marginBottom: '8px' }}>
            <span style={{ color: '#888' }}>Cities Saved: </span>
            <span style={{ color: '#fff' }}>{data.citiesSurvived}</span>
          </div>
          <div style={{ marginBottom: '8px' }}>
            <span style={{ color: '#888' }}>Duration: </span>
            <span style={{ color: '#fff' }}>{formatDuration(data.duration)}</span>
          </div>
          <div style={{ marginBottom: '8px' }}>
            <span style={{ color: '#888' }}>Total Shots: </span>
            <span style={{ color: '#fff' }}>{stats.totalShots}</span>
          </div>
          <div>
            <span style={{ color: '#888' }}>Shots/sec: </span>
            <span style={{ color: '#fff' }}>{stats.shotsPerSecond.toFixed(2)}</span>
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#0d0d1a',
            borderRadius: '4px',
            padding: '8px',
            marginBottom: '16px',
            textAlign: 'center',
          }}
        >
          <div style={{ color: '#888', fontSize: '12px', marginBottom: '4px' }}>
            Share Code
          </div>
          <div
            style={{
              fontFamily: 'monospace',
              fontSize: '14px',
              color: '#ef4444',
              cursor: 'pointer',
            }}
            onClick={copyShareCode}
          >
            {shareCode}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            onClick={copyReplayCode}
            style={{
              backgroundColor: copied ? '#22c55e' : '#ef4444',
              color: '#fff',
              border: 'none',
              padding: '10px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '14px',
            }}
          >
            {copied ? 'COPIED!' : 'COPY REPLAY CODE'}
          </button>

          {onWatch && (
            <button
              onClick={onWatch}
              style={{
                backgroundColor: '#3b82f6',
                color: '#fff',
                border: 'none',
                padding: '10px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '14px',
              }}
            >
              WATCH REPLAY
            </button>
          )}

          <button
            onClick={onClose}
            style={{
              backgroundColor: 'transparent',
              color: '#888',
              border: '1px solid #888',
              padding: '10px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}
