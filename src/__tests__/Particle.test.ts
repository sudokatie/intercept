import { Particle, createCityDebris } from '../game/Particle';

describe('Particle', () => {
  it('initializes with correct values', () => {
    const p = new Particle(100, 200, 50, -100, 1.0, '#ff0000', 4);
    expect(p.x).toBe(100);
    expect(p.y).toBe(200);
    expect(p.life).toBe(1.0);
    expect(p.maxLife).toBe(1.0);
    expect(p.color).toBe('#ff0000');
    expect(p.size).toBe(4);
    expect(p.alpha).toBe(1);
  });

  it('moves based on velocity', () => {
    const p = new Particle(100, 200, 50, -100, 1.0, '#ff0000', 4);
    p.update(0.1);
    expect(p.x).toBeCloseTo(105); // 100 + 50 * 0.1
    expect(p.y).toBeCloseTo(190); // 200 + -100 * 0.1 (gravity affects next frame)
  });

  it('applies gravity over time', () => {
    const p = new Particle(100, 200, 0, 0, 1.0, '#ff0000', 4);
    p.update(0.1); // first frame: y stays, vy becomes 20
    p.update(0.1); // second frame: y += 20 * 0.1 = 202
    expect(p.y).toBeGreaterThan(200); // gravity eventually pushes down
  });

  it('decreases life over time', () => {
    const p = new Particle(100, 200, 0, 0, 1.0, '#ff0000', 4);
    p.update(0.3);
    expect(p.life).toBeCloseTo(0.7);
  });

  it('reports dead when life <= 0', () => {
    const p = new Particle(100, 200, 0, 0, 0.5, '#ff0000', 4);
    expect(p.isDead()).toBe(false);
    p.update(0.5);
    expect(p.isDead()).toBe(true);
  });

  it('calculates alpha based on remaining life', () => {
    const p = new Particle(100, 200, 0, 0, 1.0, '#ff0000', 4);
    expect(p.alpha).toBe(1);
    p.update(0.5);
    expect(p.alpha).toBeCloseTo(0.5);
  });

  it('returns correct data', () => {
    const p = new Particle(100, 200, 50, -100, 1.0, '#ff0000', 4);
    const data = p.getData();
    expect(data.x).toBe(100);
    expect(data.y).toBe(200);
    expect(data.vx).toBe(50);
    expect(data.vy).toBe(-100);
    expect(data.life).toBe(1.0);
    expect(data.maxLife).toBe(1.0);
    expect(data.color).toBe('#ff0000');
    expect(data.size).toBe(4);
  });
});

describe('createCityDebris', () => {
  it('creates multiple particles', () => {
    const particles = createCityDebris(100, 400);
    expect(particles.length).toBe(15);
  });

  it('creates particles near the city position', () => {
    const particles = createCityDebris(100, 400);
    for (const p of particles) {
      expect(p.x).toBe(100);
      expect(p.y).toBe(400);
    }
  });

  it('creates particles with upward velocities', () => {
    const particles = createCityDebris(100, 400);
    // At least some should have upward velocity
    const upwardParticles = particles.filter(p => p.getData().vy < 0);
    expect(upwardParticles.length).toBeGreaterThan(0);
  });

  it('creates particles with varied colors', () => {
    const particles = createCityDebris(100, 400);
    const colors = new Set(particles.map(p => p.color));
    expect(colors.size).toBeGreaterThan(1);
  });

  it('creates particles with varied sizes', () => {
    const particles = createCityDebris(100, 400);
    const sizes = new Set(particles.map(p => p.size));
    expect(sizes.size).toBeGreaterThan(1);
  });
});
