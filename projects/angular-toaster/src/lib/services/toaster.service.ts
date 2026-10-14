import { isPlatformBrowser } from '@angular/common';
import { Injectable, OnDestroy, PLATFORM_ID, inject, signal } from '@angular/core';

import { TOASTER_CONFIG } from '../config/toaster.config';
import {
  ToasterConfig,
  ToasterItem,
  ToasterOptions,
  ToasterShowOptions,
  ToasterType,
} from '../models/toaster.types';
import { definedOnly } from '../utils/defined-only';
import { generateToasterId } from '../utils/id';
import { PausableTimer } from '../utils/pausable-timer';

/**
 * Creates, queues and removes toasts. Render them with `<st-toaster />`.
 *
 * Every method that creates a toast returns its id, so you can `remove(id)` it later.
 */
@Injectable({
  providedIn: 'root',
})
export class ToasterService implements OnDestroy {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly _settings = signal<Required<ToasterConfig>>({ ...inject(TOASTER_CONFIG) });
  private readonly _items = signal<ToasterItem[]>([]);

  /** Toasts waiting for a free slot (only used when `queue` is on). */
  private readonly queue: ToasterItem[] = [];
  private readonly timers = new Map<string, PausableTimer>();

  /** Current global settings (read-only). Change them with `configure()`. */
  readonly settings = this._settings.asReadonly();

  /** Toasts currently on screen. */
  readonly items = this._items.asReadonly();

  // ============================================================
  // Create
  // ============================================================

  /** `success('Saved')`, `success('Saved', 'Done')` or `success('Saved', { duration: 0 })`. */
  success(message: string, titleOrOptions?: string | ToasterOptions): string {
    return this.show({ ...this.normalize(titleOrOptions), message, type: 'success' });
  }

  error(message: string, titleOrOptions?: string | ToasterOptions): string {
    return this.show({ ...this.normalize(titleOrOptions), message, type: 'error' });
  }

  warning(message: string, titleOrOptions?: string | ToasterOptions): string {
    return this.show({ ...this.normalize(titleOrOptions), message, type: 'warning' });
  }

  info(message: string, titleOrOptions?: string | ToasterOptions): string {
    return this.show({ ...this.normalize(titleOrOptions), message, type: 'info' });
  }

  /**
   * Show a toast. Returns its id. When `preventDuplicates` is on and the same toast is
   * already shown or queued, nothing new is created and the id of the existing one is returned.
   */
  show(options: ToasterShowOptions): string {
    const settings = this._settings();
    const type: ToasterType = options.type ?? settings.type;

    if (settings.preventDuplicates) {
      const duplicate = this.findDuplicate(type, options.message, options.title);

      if (duplicate) {
        return duplicate.id;
      }
    }

    const item: ToasterItem = {
      id: generateToasterId(),
      title: options.title,
      message: options.message,
      type,
      duration: options.duration ?? settings.duration,
      position: options.position ?? settings.position,
      showClose: options.showClose ?? settings.showClose,
      progressBar: options.progressBar ?? settings.progressBar,
      pauseOnHover: options.pauseOnHover ?? settings.pauseOnHover,
      showIcon: options.showIcon ?? settings.showIcon,
      icon: options.icon,
      action: options.action,
      actionHandler: options.actionHandler,
      cssClass: options.cssClass,
      data: options.data,
      createdAt: Date.now(),
    };

    if (this._items().length >= this.limit()) {
      if (settings.queue) {
        this.queue.push(item);
        return item.id;
      }

      this.evictOldest();
    }

    this.display(item);

    return item.id;
  }

  // ============================================================
  // Remove
  // ============================================================

  /** Remove one toast (on screen or queued). Unknown ids are ignored. */
  remove(id: string): void {
    const queuedIndex = this.queue.findIndex((item) => item.id === id);

    if (queuedIndex !== -1) {
      this.queue.splice(queuedIndex, 1);
      return;
    }

    if (this.detach(id)) {
      this.promoteFromQueue();
    }
  }

  /** Remove every toast, including the queued ones. */
  clear(): void {
    this.timers.forEach((timer) => timer.stop());
    this.timers.clear();

    this.queue.length = 0;
    this._items.set([]);
  }

  // ============================================================
  // Timer control (used by the component for hover-to-pause)
  // ============================================================

  pause(id: string): void {
    this.timers.get(id)?.pause();
  }

  resume(id: string): void {
    this.timers.get(id)?.resume();
  }

  // ============================================================
  // Settings
  // ============================================================

  /** Change global settings at runtime, e.g. `configure({ theme: 'dark' })`. */
  configure(config: ToasterConfig): void {
    this._settings.update((current) => ({ ...current, ...definedOnly(config) }));
    this.promoteFromQueue();
  }

  ngOnDestroy(): void {
    this.timers.forEach((timer) => timer.stop());
    this.timers.clear();
  }

  // ============================================================
  // Internals
  // ============================================================

  private normalize(titleOrOptions?: string | ToasterOptions): ToasterOptions {
    return typeof titleOrOptions === 'string' ? { title: titleOrOptions } : (titleOrOptions ?? {});
  }

  private limit(): number {
    const { max } = this._settings();

    return max > 0 ? max : Number.POSITIVE_INFINITY;
  }

  private findDuplicate(type: ToasterType, message: string, title?: string): ToasterItem | undefined {
    const matches = (item: ToasterItem): boolean =>
      item.type === type && item.message === message && item.title === title;

    return this._items().find(matches) ?? this.queue.find(matches);
  }

  private display(item: ToasterItem): void {
    this._items.update((items) =>
      this._settings().newestOnTop ? [item, ...items] : [...items, item],
    );

    this.autoClose(item);
  }

  private autoClose(item: ToasterItem): void {
    // No timers on the server: they would keep server rendering waiting.
    if (item.duration <= 0 || !this.isBrowser) {
      return;
    }

    const timer = new PausableTimer(item.duration, () => this.remove(item.id));

    this.timers.set(item.id, timer);
    timer.start();
  }

  /** Removes a toast from the screen without touching the queue. Returns `false` if it was not shown. */
  private detach(id: string): boolean {
    const exists = this._items().some((item) => item.id === id);

    if (!exists) {
      return false;
    }

    this.timers.get(id)?.stop();
    this.timers.delete(id);
    this._items.update((items) => items.filter((item) => item.id !== id));

    return true;
  }

  private evictOldest(): void {
    const items = this._items();

    if (!items.length) {
      return;
    }

    const oldest = items.reduce((a, b) => (b.createdAt < a.createdAt ? b : a));

    this.detach(oldest.id);
  }

  private promoteFromQueue(): void {
    while (this.queue.length && this._items().length < this.limit()) {
      const next = this.queue.shift();

      if (next) {
        this.display(next);
      }
    }
  }
}
