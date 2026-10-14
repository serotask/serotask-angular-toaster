import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';

import { ToasterItem } from '../../models/toaster.types';
import { ToasterService } from '../../services/toaster.service';

/** One toast. You normally never use it directly: `<st-toaster />` renders it for you. */
@Component({
  selector: 'st-toaster-item',
  templateUrl: './st-toaster-item.html',
  styleUrl: './st-toaster-item.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StToasterItem {
  private readonly toaster = inject(ToasterService);

  readonly item = input.required<ToasterItem>();

  /** Emits the toast id when the user closes it (close button or action). */
  readonly dismissed = output<string>();

  /** `true` while the countdown is paused by hover / keyboard focus. */
  protected readonly paused = signal(false);

  protected readonly isAlert = computed(() => {
    const { type } = this.item();

    return type === 'error' || type === 'warning';
  });

  protected readonly showProgress = computed(() => {
    const { progressBar, duration } = this.item();

    return progressBar && duration > 0;
  });

  protected readonly rootClass = computed(() => {
    const { type, cssClass } = this.item();
    const animation = this.toaster.settings().animation;

    return ['st-toaster-item', `st-toaster-item--${type}`, `st-toaster-item--anim-${animation}`, cssClass]
      .filter(Boolean)
      .join(' ');
  });

  protected hold(): void {
    const { id, pauseOnHover, duration } = this.item();

    if (!pauseOnHover || duration <= 0) {
      return;
    }

    this.paused.set(true);
    this.toaster.pause(id);
  }

  protected release(): void {
    if (!this.paused()) {
      return;
    }

    this.paused.set(false);
    this.toaster.resume(this.item().id);
  }

  protected close(): void {
    this.dismissed.emit(this.item().id);
  }

  protected runAction(): void {
    this.item().actionHandler?.();
    this.close();
  }
}
