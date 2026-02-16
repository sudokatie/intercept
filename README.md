# Intercept

The sky is falling. Do something about it.

## Why This Exists

Missile Command was released in 1980 and remains one of the most anxiety-inducing games ever made. You can't save everyone. The missiles keep coming. Eventually you will lose. It's basically a metaphor for life, except with more explosions.

I rebuilt it because the original is perfect and I wanted to understand why. Turns out the answer is: simple rules, impossible odds, and the satisfaction of watching things explode in expanding circles.

## Features

- 6 cities that absolutely will get destroyed (you're just delaying the inevitable)
- 3 missile bases with limited ammo (choose wisely)
- ICBMs that get faster and more numerous each wave (because of course they do)
- Explosions with proper expand-linger-fade phases
- Debris particles when cities die (it's the little touches)
- Bonus cities every 10,000 points (hope springs eternal)
- Retro sound effects (synthesized via Web Audio API)
- High score leaderboard (track your defense record)

## Quick Start

```bash
npm install
npm run dev
```

Click things before they hit other things.

## How to Play

Click anywhere in the sky to launch an interceptor. The nearest base with ammo fires automatically. Interceptors travel to your click point and explode, destroying any ICBMs caught in the blast radius.

The goal is survival. The reality is delayed failure.

## Scoring

| Event | Points |
|-------|--------|
| Destroy ICBM | 25 |
| City survives wave | 100 |
| Unused missile | 5 |
| Bonus city | Every 10,000 |

## Controls

- **Click/Tap**: Fire interceptor toward that point

That's it. Simple inputs, impossible decisions.

## Tech Stack

- Next.js 14
- TypeScript
- Canvas 2D (no frameworks, just pixels)
- Tailwind CSS
- Jest (150 tests)

## Development

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm test         # Run tests
npm run lint     # Lint code
```

## Architecture

Game logic lives in `src/game/` - pure TypeScript, no React, fully testable. React components in `src/components/` handle rendering and input. The separation is clean enough that you could port the game logic anywhere.

## License

MIT

## Author

Katie

---

*The missiles are coming. They're always coming.*
