import { TestBed } from '@angular/core/testing';

import { provideToaster } from '../config/toaster.config';
import { ToasterConfig } from '../models/toaster.types';
import { ToasterService } from './toaster.service';

function setup(config: ToasterConfig = {}): ToasterService {
  TestBed.configureTestingModule({ providers: [provideToaster(config)] });

  return TestBed.inject(ToasterService);
}

describe('ToasterService', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('creating toasts', () => {
    it('creates toasts of every type', () => {
      const toaster = setup({ duration: 0 });

      toaster.success('a');
      toaster.error('b');
      toaster.warning('c');
      toaster.info('d');

      const types = toaster.items().map((item) => item.type).sort();
      expect(types).toEqual(['error', 'info', 'success', 'warning']);
    });

    it('accepts a title as the second argument', () => {
      const toaster = setup({ duration: 0 });

      toaster.success('Saved', 'Done');

      expect(toaster.items()[0].title).toBe('Done');
      expect(toaster.items()[0].message).toBe('Saved');
    });

    it('accepts options as the second argument', () => {
      const toaster = setup();

      toaster.error('Failed', { title: 'Oops', duration: 0, position: 'bottom-left', showIcon: false });
      const item = toaster.items()[0];

      expect(item.title).toBe('Oops');
      expect(item.duration).toBe(0);
      expect(item.position).toBe('bottom-left');
      expect(item.showIcon).toBe(false);
    });

    it('uses global defaults for options that are not given', () => {
      const toaster = setup({ position: 'bottom-center', duration: 1234, progressBar: false });

      toaster.info('Hello');
      const item = toaster.items()[0];

      expect(item.position).toBe('bottom-center');
      expect(item.duration).toBe(1234);
      expect(item.progressBar).toBe(false);
    });

    it('show() uses the default type of the config', () => {
      const toaster = setup({ type: 'warning' });

      toaster.show({ message: 'Hello' });

      expect(toaster.items()[0].type).toBe('warning');
    });

    it('returns the id of the created toast', () => {
      const toaster = setup();

      const id = toaster.success('Saved');

      expect(toaster.items()[0].id).toBe(id);
    });

    it('ignores undefined config values', () => {
      const toaster = setup({ position: undefined });

      toaster.info('Hello');

      expect(toaster.items()[0].position).toBe('top-right');
    });
  });

  describe('order', () => {
    it('newestOnTop: puts the newest toast first', () => {
      const toaster = setup({ duration: 0 });

      toaster.info('first');
      toaster.info('second');

      expect(toaster.items().map((item) => item.message)).toEqual(['second', 'first']);
    });

    it('newestOnTop: false puts the newest toast last', () => {
      const toaster = setup({ duration: 0, newestOnTop: false });

      toaster.info('first');
      toaster.info('second');

      expect(toaster.items().map((item) => item.message)).toEqual(['first', 'second']);
    });
  });

  describe('auto close', () => {
    it('closes after the duration', () => {
      const toaster = setup({ duration: 1000 });

      toaster.info('Hello');
      vi.advanceTimersByTime(999);
      expect(toaster.items()).toHaveLength(1);

      vi.advanceTimersByTime(1);
      expect(toaster.items()).toHaveLength(0);
    });

    it('duration 0 keeps the toast until it is removed', () => {
      const toaster = setup();

      const id = toaster.info('Stay', { duration: 0 });
      vi.advanceTimersByTime(60_000);
      expect(toaster.items()).toHaveLength(1);

      toaster.remove(id);
      expect(toaster.items()).toHaveLength(0);
    });

    it('pause() stops the countdown and resume() continues it', () => {
      const toaster = setup({ duration: 1000 });
      const id = toaster.info('Hello');

      vi.advanceTimersByTime(600);
      toaster.pause(id);
      vi.advanceTimersByTime(5000);
      expect(toaster.items()).toHaveLength(1);

      toaster.resume(id);
      vi.advanceTimersByTime(399);
      expect(toaster.items()).toHaveLength(1);

      vi.advanceTimersByTime(1);
      expect(toaster.items()).toHaveLength(0);
    });

    it('pause()/resume() on unknown ids are harmless', () => {
      const toaster = setup();

      expect(() => {
        toaster.pause('nope');
        toaster.resume('nope');
      }).not.toThrow();
    });
  });

  describe('max, queue and eviction', () => {
    it('queues toasts above max and shows them when a slot frees up', () => {
      const toaster = setup({ max: 2, duration: 0 });

      const first = toaster.info('1');
      toaster.info('2');
      toaster.info('3');
      expect(toaster.items().map((item) => item.message)).toEqual(['2', '1']);

      toaster.remove(first);
      expect(toaster.items().map((item) => item.message).sort()).toEqual(['2', '3']);
    });

    it('a queued toast gets its own countdown once it is shown', () => {
      const toaster = setup({ max: 1, duration: 1000, preventDuplicates: false });

      toaster.info('1');
      toaster.info('2');

      vi.advanceTimersByTime(1000);
      expect(toaster.items().map((item) => item.message)).toEqual(['2']);

      vi.advanceTimersByTime(999);
      expect(toaster.items()).toHaveLength(1);

      vi.advanceTimersByTime(1);
      expect(toaster.items()).toHaveLength(0);
    });

    it('queue: false drops the oldest toast instead of exceeding max', () => {
      const toaster = setup({ max: 2, queue: false, duration: 0 });

      toaster.info('1');
      vi.advanceTimersByTime(1);
      toaster.info('2');
      vi.advanceTimersByTime(1);
      toaster.info('3');

      expect(toaster.items().map((item) => item.message)).toEqual(['3', '2']);
    });

    it('max 0 means unlimited', () => {
      const toaster = setup({ max: 0, duration: 0, preventDuplicates: false });

      for (let i = 0; i < 20; i++) {
        toaster.info(`toast ${i}`);
      }

      expect(toaster.items()).toHaveLength(20);
    });

    it('removing a queued toast does not show the next one early', () => {
      const toaster = setup({ max: 1, duration: 0 });

      toaster.info('1');
      const queued = toaster.info('2');
      toaster.info('3');

      toaster.remove(queued);
      expect(toaster.items().map((item) => item.message)).toEqual(['1']);
    });

    it('removing an unknown id does not pull a toast from the queue', () => {
      const toaster = setup({ max: 1, duration: 0 });

      toaster.info('1');
      toaster.info('2');

      toaster.remove('nope');
      expect(toaster.items().map((item) => item.message)).toEqual(['1']);
    });

    it('configure({ max }) shows queued toasts when there is room', () => {
      const toaster = setup({ max: 1, duration: 0 });

      toaster.info('1');
      toaster.info('2');
      toaster.configure({ max: 2 });

      expect(toaster.items()).toHaveLength(2);
    });
  });

  describe('duplicates', () => {
    it('does not create the same toast twice and returns the existing id', () => {
      const toaster = setup({ duration: 0 });

      const first = toaster.error('Network error');
      const second = toaster.error('Network error');

      expect(second).toBe(first);
      expect(toaster.items()).toHaveLength(1);
    });

    it('allows the same message with another type or title', () => {
      const toaster = setup({ duration: 0 });

      toaster.error('Same');
      toaster.warning('Same');
      toaster.error('Same', 'Other title');

      expect(toaster.items()).toHaveLength(3);
    });

    it('also detects duplicates that are still in the queue', () => {
      const toaster = setup({ max: 1, duration: 0 });

      toaster.info('1');
      const queued = toaster.info('2');
      const again = toaster.info('2');

      expect(again).toBe(queued);
    });

    it('preventDuplicates: false allows duplicates', () => {
      const toaster = setup({ duration: 0, preventDuplicates: false });

      toaster.info('Same');
      toaster.info('Same');

      expect(toaster.items()).toHaveLength(2);
    });
  });

  describe('clear and configure', () => {
    it('clear() removes visible and queued toasts and stops their timers', () => {
      const toaster = setup({ max: 1, duration: 1000 });

      toaster.info('1');
      toaster.info('2');
      toaster.clear();
      vi.advanceTimersByTime(5000);

      expect(toaster.items()).toHaveLength(0);
    });

    it('configure() changes settings at runtime', () => {
      const toaster = setup();

      toaster.configure({ theme: 'dark', animation: 'bounce', rtl: true });

      expect(toaster.settings().theme).toBe('dark');
      expect(toaster.settings().animation).toBe('bounce');
      expect(toaster.settings().rtl).toBe(true);
      expect(toaster.settings().position).toBe('top-right');
    });

    it('configure() ignores undefined values', () => {
      const toaster = setup({ theme: 'dark' });

      toaster.configure({ theme: undefined });

      expect(toaster.settings().theme).toBe('dark');
    });

    it('ngOnDestroy() stops all timers', () => {
      const toaster = setup({ duration: 1000 });

      toaster.info('Hello');
      toaster.ngOnDestroy();
      vi.advanceTimersByTime(5000);

      expect(toaster.items()).toHaveLength(1);
    });
  });
});
