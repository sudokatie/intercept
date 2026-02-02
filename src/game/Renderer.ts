import { City } from './City';
import { MissileBase } from './MissileBase';
import { Interceptor } from './Interceptor';
import { ICBM } from './ICBM';
import { Explosion } from './Explosion';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  GROUND_Y,
  CITY_WIDTH,
  CITY_HEIGHT,
  COLORS,
} from './constants';

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private skyGradient: CanvasGradient | null = null;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    this.createSkyGradient();
  }

  private createSkyGradient(): void {
    this.skyGradient = this.ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    this.skyGradient.addColorStop(0, COLORS.skyTop);
    this.skyGradient.addColorStop(1, COLORS.skyBottom);
  }

  clear(): void {
    this.ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  drawSky(): void {
    if (this.skyGradient) {
      this.ctx.fillStyle = this.skyGradient;
      this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }
  }

  drawGround(): void {
    this.ctx.fillStyle = COLORS.ground;
    this.ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y);

    // Terrain line
    this.ctx.strokeStyle = '#666666';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(0, GROUND_Y);
    this.ctx.lineTo(CANVAS_WIDTH, GROUND_Y);
    this.ctx.stroke();
  }

  drawCity(city: City): void {
    const x = city.x;
    const y = GROUND_Y;
    const halfWidth = CITY_WIDTH / 2;

    this.ctx.fillStyle = city.alive ? COLORS.city : COLORS.cityDead;

    // Draw building silhouettes
    if (city.alive) {
      // Building 1 (left)
      this.ctx.fillRect(x - halfWidth, y - 25, 12, 25);
      // Building 2 (center tall)
      this.ctx.fillRect(x - 8, y - CITY_HEIGHT, 16, CITY_HEIGHT);
      // Building 3 (right)
      this.ctx.fillRect(x + halfWidth - 12, y - 20, 12, 20);
    } else {
      // Rubble
      this.ctx.fillRect(x - halfWidth, y - 5, CITY_WIDTH, 5);
      this.ctx.fillRect(x - 10, y - 8, 8, 8);
      this.ctx.fillRect(x + 2, y - 6, 6, 6);
    }
  }

  drawCities(cities: City[]): void {
    for (const city of cities) {
      this.drawCity(city);
    }
  }

  drawBase(base: MissileBase): void {
    const x = base.x;
    const y = GROUND_Y;

    this.ctx.fillStyle = base.alive ? COLORS.base : COLORS.baseDead;

    // Draw triangle base
    this.ctx.beginPath();
    this.ctx.moveTo(x, y - 20);
    this.ctx.lineTo(x - 20, y);
    this.ctx.lineTo(x + 20, y);
    this.ctx.closePath();
    this.ctx.fill();

    // Draw ammo count if alive
    if (base.alive) {
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = '10px monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(base.ammo.toString(), x, y + 12);
    }
  }

  drawBases(bases: MissileBase[]): void {
    for (const base of bases) {
      this.drawBase(base);
    }
  }

  drawICBMTrail(icbm: ICBM): void {
    const gradient = this.ctx.createLinearGradient(
      icbm.startX, icbm.startY,
      icbm.x, icbm.y
    );
    gradient.addColorStop(0, 'rgba(255, 68, 0, 0.2)');
    gradient.addColorStop(1, COLORS.icbmTrail);

    this.ctx.strokeStyle = gradient;
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(icbm.startX, icbm.startY);
    this.ctx.lineTo(icbm.x, icbm.y);
    this.ctx.stroke();
  }

  drawICBMHead(icbm: ICBM): void {
    this.ctx.fillStyle = COLORS.icbmHead;
    this.ctx.beginPath();
    this.ctx.arc(icbm.x, icbm.y, 4, 0, Math.PI * 2);
    this.ctx.fill();
  }

  drawICBMTrails(icbms: ICBM[]): void {
    for (const icbm of icbms) {
      if (icbm.alive) {
        this.drawICBMTrail(icbm);
      }
    }
  }

  drawICBMHeads(icbms: ICBM[]): void {
    for (const icbm of icbms) {
      if (icbm.alive) {
        this.drawICBMHead(icbm);
      }
    }
  }

  drawInterceptorTrail(interceptor: Interceptor): void {
    const gradient = this.ctx.createLinearGradient(
      interceptor.startX, interceptor.startY,
      interceptor.x, interceptor.y
    );
    gradient.addColorStop(0, 'rgba(0, 170, 255, 0.2)');
    gradient.addColorStop(1, COLORS.interceptorTrail);

    this.ctx.strokeStyle = gradient;
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(interceptor.startX, interceptor.startY);
    this.ctx.lineTo(interceptor.x, interceptor.y);
    this.ctx.stroke();
  }

  drawInterceptorHead(interceptor: Interceptor): void {
    this.ctx.fillStyle = COLORS.interceptorHead;
    this.ctx.beginPath();
    this.ctx.arc(interceptor.x, interceptor.y, 3, 0, Math.PI * 2);
    this.ctx.fill();
  }

  drawInterceptorTrails(interceptors: Interceptor[]): void {
    for (const interceptor of interceptors) {
      this.drawInterceptorTrail(interceptor);
    }
  }

  drawInterceptorHeads(interceptors: Interceptor[]): void {
    for (const interceptor of interceptors) {
      this.drawInterceptorHead(interceptor);
    }
  }

  drawExplosion(explosion: Explosion): void {
    const { x, y, radius, alpha } = explosion;

    // Radial gradient
    const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
    gradient.addColorStop(0.4, `rgba(255, 255, 0, ${alpha * 0.8})`);
    gradient.addColorStop(1, `rgba(255, 102, 0, ${alpha * 0.3})`);

    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fill();
  }

  drawExplosions(explosions: Explosion[]): void {
    for (const explosion of explosions) {
      this.drawExplosion(explosion);
    }
  }

  drawHUD(score: number, wave: number, citiesAlive: number): void {
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '16px monospace';

    // Score (top left)
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`SCORE: ${score}`, 10, 25);

    // Wave (top center)
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`WAVE ${wave}`, CANVAS_WIDTH / 2, 25);

    // Cities (top right)
    this.ctx.textAlign = 'right';
    this.ctx.fillText(`CITIES: ${citiesAlive}`, CANVAS_WIDTH - 10, 25);
  }

  render(
    cities: City[],
    bases: MissileBase[],
    interceptors: Interceptor[],
    icbms: ICBM[],
    explosions: Explosion[],
    score: number,
    wave: number
  ): void {
    this.clear();
    this.drawSky();
    this.drawGround();
    this.drawCities(cities);
    this.drawBases(bases);
    this.drawICBMTrails(icbms);
    this.drawInterceptorTrails(interceptors);
    this.drawICBMHeads(icbms);
    this.drawInterceptorHeads(interceptors);
    this.drawExplosions(explosions);

    const citiesAlive = cities.filter(c => c.alive).length;
    this.drawHUD(score, wave, citiesAlive);
  }
}
