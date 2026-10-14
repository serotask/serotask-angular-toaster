/**
 * A timeout that can be paused and resumed (used for hover-to-pause).
 * Safe to call in any order: pausing twice, resuming without pausing, or using it after `stop()`.
 */
export class PausableTimer {
  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  private startedAt = 0;
  private remaining: number;
  private stopped = false;

  constructor(
    duration: number,
    private readonly callback: () => void,
  ) {
    this.remaining = Math.max(0, duration);
  }

  get isRunning(): boolean {
    return this.timeoutId !== null;
  }

  start(): void {
    if (this.stopped || this.timeoutId !== null) {
      return;
    }

    this.startedAt = Date.now();
    this.timeoutId = setTimeout(() => {
      this.timeoutId = null;
      this.remaining = 0;
      this.callback();
    }, this.remaining);
  }

  pause(): void {
    if (this.timeoutId === null) {
      return;
    }

    clearTimeout(this.timeoutId);
    this.timeoutId = null;
    this.remaining = Math.max(0, this.remaining - (Date.now() - this.startedAt));
  }

  resume(): void {
    this.start();
  }

  stop(): void {
    this.stopped = true;

    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}
