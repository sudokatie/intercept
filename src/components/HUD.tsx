'use client';

interface HUDProps {
  score: number;
  wave: number;
  cities: number;
}

export function HUD({ score, wave, cities }: HUDProps) {
  return (
    <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-2 pointer-events-none text-white font-mono text-sm">
      <div>SCORE: {score}</div>
      <div>WAVE {wave}</div>
      <div>CITIES: {cities}</div>
    </div>
  );
}
