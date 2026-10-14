import { PausableTimer } from './pausable-timer';

describe('PausableTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('fires the callback after the duration', () => {
    const callback = vi.fn();
    const timer = new PausableTimer(1000, callback);

    timer.start();
    vi.advanceTimersByTime(999);
    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('keeps the remaining time while paused', () => {
    const callback = vi.fn();
    const timer = new PausableTimer(1000, callback);

    timer.start();
    vi.advanceTimersByTime(600);
    timer.pause();
    vi.advanceTimersByTime(5000);
    expect(callback).not.toHaveBeenCalled();

    timer.resume();
    vi.advanceTimersByTime(399);
    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('pausing twice does not lose extra time', () => {
    const callback = vi.fn();
    const timer = new PausableTimer(1000, callback);

    timer.start();
    vi.advanceTimersByTime(400);
    timer.pause();
    vi.advanceTimersByTime(300);
    timer.pause();
    timer.resume();

    vi.advanceTimersByTime(599);
    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('start() twice does not create a second timeout', () => {
    const callback = vi.fn();
    const timer = new PausableTimer(500, callback);

    timer.start();
    timer.start();
    vi.advanceTimersByTime(2000);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('never fires after stop(), even if resumed', () => {
    const callback = vi.fn();
    const timer = new PausableTimer(500, callback);

    timer.start();
    timer.stop();
    timer.resume();
    vi.advanceTimersByTime(2000);

    expect(callback).not.toHaveBeenCalled();
    expect(timer.isRunning).toBe(false);
  });
});
