# Intercept

A Missile Command style arcade game built with Next.js and TypeScript.

Defend your cities from incoming ICBMs by launching interceptor missiles. Click or tap to fire interceptors that explode in expanding spheres, destroying any missiles caught in the blast.

## Play

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to play.

## How to Play

- 6 cities along the bottom need protection
- 3 missile bases (left, center, right) with limited ammo
- Click anywhere to launch an interceptor toward that point
- Interceptors explode on arrival, destroying nearby ICBMs
- Survive as many waves as possible

## Scoring

- Destroy ICBM: 25 points
- City survives wave: 100 points
- Unused missile: 5 points

## Controls

- **Click/Tap**: Fire interceptor toward that point
- The nearest base with ammo fires automatically

## Tech Stack

- Next.js 14 with App Router
- TypeScript
- Canvas 2D rendering
- Tailwind CSS for UI
- Jest for testing

## Development

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm test         # Run tests
npm run lint     # Run linter
```

## Architecture

```
src/
├── app/           # Next.js pages
├── components/    # React UI components
│   ├── GameCanvas.tsx
│   ├── TitleScreen.tsx
│   ├── GameOver.tsx
│   └── HUD.tsx
└── game/          # Game logic (pure TypeScript)
    ├── City.ts
    ├── MissileBase.ts
    ├── Interceptor.ts
    ├── ICBM.ts
    ├── Explosion.ts
    ├── Wave.ts
    ├── Collision.ts
    ├── Game.ts
    ├── Renderer.ts
    └── Input.ts
```

All game logic is testable without React. The `game/` directory contains pure TypeScript classes with no framework dependencies.

## License

MIT
