import { CANVAS_SCALE } from './constants';

export type ClickHandler = (x: number, y: number) => void;

export class Input {
  private canvas: HTMLCanvasElement | null = null;
  private onClick: ClickHandler | null = null;
  private boundHandleClick: ((e: MouseEvent) => void) | null = null;
  private boundHandleTouch: ((e: TouchEvent) => void) | null = null;

  attach(canvas: HTMLCanvasElement, onClick: ClickHandler): void {
    this.canvas = canvas;
    this.onClick = onClick;

    this.boundHandleClick = this.handleClick.bind(this);
    this.boundHandleTouch = this.handleTouch.bind(this);

    canvas.addEventListener('click', this.boundHandleClick);
    canvas.addEventListener('touchend', this.boundHandleTouch);
  }

  detach(): void {
    if (this.canvas && this.boundHandleClick) {
      this.canvas.removeEventListener('click', this.boundHandleClick);
    }
    if (this.canvas && this.boundHandleTouch) {
      this.canvas.removeEventListener('touchend', this.boundHandleTouch);
    }
    this.canvas = null;
    this.onClick = null;
    this.boundHandleClick = null;
    this.boundHandleTouch = null;
  }

  private handleClick(e: MouseEvent): void {
    if (!this.canvas || !this.onClick) return;

    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX / CANVAS_SCALE;
    const y = (e.clientY - rect.top) * scaleY / CANVAS_SCALE;

    this.onClick(x, y);
  }

  private handleTouch(e: TouchEvent): void {
    if (!this.canvas || !this.onClick) return;

    e.preventDefault();

    const touch = e.changedTouches[0];
    if (!touch) return;

    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;

    const x = (touch.clientX - rect.left) * scaleX / CANVAS_SCALE;
    const y = (touch.clientY - rect.top) * scaleY / CANVAS_SCALE;

    this.onClick(x, y);
  }
}
