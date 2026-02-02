'use client';

interface TitleScreenProps {
  onStart: () => void;
}

export function TitleScreen({ onStart }: TitleScreenProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
      <h1 className="text-6xl font-bold text-cyan-400 mb-4 tracking-wider">
        INTERCEPT
      </h1>
      <p className="text-gray-400 mb-8 text-center max-w-md px-4">
        Defend your cities from incoming missiles.
        <br />
        Click to launch interceptors.
      </p>
      <button
        onClick={onStart}
        className="px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-white text-xl font-bold rounded-lg transition-colors"
      >
        START GAME
      </button>
      <div className="mt-8 text-gray-500 text-sm">
        Click or tap to fire
      </div>
    </div>
  );
}
