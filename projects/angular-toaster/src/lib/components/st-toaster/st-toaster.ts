import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { ToasterItem, ToasterPosition } from '../../models/toaster.types';
import { ToasterService } from '../../services/toaster.service';
import { StToasterItem } from '../st-toaster-item/st-toaster-item';

const POSITIONS: readonly ToasterPosition[] = [
  'top-left',
  'top-center',
  'top-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
];

interface ToasterGroup {
  position: ToasterPosition;
  items: ToasterItem[];
}

/**
 * Renders all toasts. Place it once, in your root component:
 *
 * ```html
 * <st-toaster />
 * ```
 */
@Component({
  selector: 'st-toaster',
  imports: [StToasterItem],
  templateUrl: './st-toaster.html',
  styleUrl: './st-toaster.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StToaster {
  private readonly toaster = inject(ToasterService);

  protected readonly settings = this.toaster.settings;

  protected readonly rootClass = computed(() => `st-toaster st-toaster--${this.settings().theme}`);

  /** Toasts grouped by screen position (empty groups are skipped). */
  protected readonly groups = computed<ToasterGroup[]>(() => {
    const items = this.toaster.items();

    return POSITIONS.map((position) => ({
      position,
      items: items.filter((item) => item.position === position),
    })).filter((group) => group.items.length > 0);
  });

  protected remove(id: string): void {
    this.toaster.remove(id);
  }
}
