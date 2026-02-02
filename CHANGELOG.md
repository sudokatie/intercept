# Changelog

## [0.1.1] - 2026-02-02

### Fixed

- Implemented bonus city feature (every 10,000 points revives a dead city)
- Added addScore method for game extensibility

### Changed

- Updated README to document bonus city scoring
- Added 4 new tests for scoring mechanics (150 total)

## [0.1.0] - 2026-02-02

### Added

- Core game entities: City, MissileBase, Interceptor, ICBM, Explosion
- Wave system with scaling difficulty (more missiles, faster speed each wave)
- Collision detection (ICBM vs explosions, ground impacts)
- Game orchestrator with full game loop
- Canvas renderer with gradient trails and explosion effects
- Input handling for mouse and touch
- React UI components: TitleScreen, GameOver, HUD
- 146 unit tests covering all game logic
- TypeScript strict mode
- Tailwind CSS styling

### Game Features

- 6 cities to defend
- 3 missile bases with limited ammo
- Click to fire interceptors
- Expanding explosion spheres destroy ICBMs
- Score tracking with wave bonuses
- Automatic wave progression
