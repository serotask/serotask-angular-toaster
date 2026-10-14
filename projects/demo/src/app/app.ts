import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';

import {
  StToaster,
  ToasterAnimation,
  ToasterOptions,
  ToasterPosition,
  ToasterService,
  ToasterTheme,
  ToasterType,
} from '@serotask/angular-toaster';

@Component({
  selector: 'app-root',
  imports: [StToaster],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly toaster = inject(ToasterService);

  protected readonly types: ToasterType[] = ['success', 'error', 'warning', 'info'];
  protected readonly positions: ToasterPosition[] = [
    'top-left',
    'top-center',
    'top-right',
    'bottom-left',
    'bottom-center',
    'bottom-right',
  ];
  protected readonly themes: ToasterTheme[] = ['light', 'dark', 'auto'];
  protected readonly animations: ToasterAnimation[] = ['fade', 'slide', 'scale', 'bounce'];

  protected readonly title = signal('Heads up');
  protected readonly message = signal('This is a toast message.');
  protected readonly duration = signal(4000);
  protected readonly position = signal<ToasterPosition>('top-right');
  protected readonly showClose = signal(true);
  protected readonly progressBar = signal(true);
  protected readonly pauseOnHover = signal(true);
  protected readonly showIcon = signal(true);

  protected readonly log = signal<string[]>([]);

  // ---------- helpers for the template ----------

  protected value(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  protected checked(event: Event): boolean {
    return (event.target as HTMLInputElement).checked;
  }

  protected asPosition(value: string): ToasterPosition {
    return value as ToasterPosition;
  }

  protected asTheme(value: string): ToasterTheme {
    return value as ToasterTheme;
  }

  protected asAnimation(value: string): ToasterAnimation {
    return value as ToasterAnimation;
  }

  // ---------- toasts ----------

  /** Options chosen in the form (per-toast options). */
  private formOptions(): ToasterOptions {
    return {
      title: this.title() || undefined,
      duration: this.duration(),
      position: this.position(),
      showClose: this.showClose(),
      progressBar: this.progressBar(),
      pauseOnHover: this.pauseOnHover(),
      showIcon: this.showIcon(),
    };
  }

  protected fire(type: ToasterType): void {
    const id = this.toaster.show({ ...this.formOptions(), message: this.message(), type });
    this.note(`show({ type: '${type}' }) -> ${id.slice(0, 8)}`);
  }

  protected withAction(): void {
    this.toaster.success('Item deleted', {
      ...this.formOptions(),
      title: 'Deleted',
      duration: 8000,
      action: 'Undo',
      actionHandler: () => {
        this.toaster.info('Item restored', { duration: 2500 });
        this.note('Undo clicked');
      },
    });
    this.note('success with an Undo action');
  }

  protected persistent(): void {
    const id = this.toaster.info('I stay until you close me.', {
      ...this.formOptions(),
      title: 'Persistent',
      duration: 0,
    });
    this.note(`persistent toast ${id.slice(0, 8)} (duration: 0)`);
  }

  protected burst(): void {
    // More toasts than `max` (5): the rest wait in the queue.
    for (let i = 1; i <= 8; i++) {
      this.toaster.show({
        ...this.formOptions(),
        message: `Burst toast ${i} of 8`,
        type: this.types[i % this.types.length],
        duration: 3000,
      });
    }
    this.note('burst: 8 toasts, max 5 on screen, the rest queued');
  }

  protected duplicate(): void {
    this.toaster.error('Network error', { ...this.formOptions() });
    this.toaster.error('Network error', { ...this.formOptions() });
    this.note('same toast twice -> only one is shown (preventDuplicates)');
  }

  protected clearAll(): void {
    this.toaster.clear();
    this.note('clear()');
  }

  // ---------- global settings (configure) ----------

  protected setTheme(theme: ToasterTheme): void {
    this.toaster.configure({ theme });
  }

  protected setAnimation(animation: ToasterAnimation): void {
    this.toaster.configure({ animation });
  }

  protected setRtl(rtl: boolean): void {
    this.toaster.configure({ rtl });
  }

  protected setMax(max: number): void {
    this.toaster.configure({ max: Number.isFinite(max) ? max : 5 });
  }

  protected setQueue(queue: boolean): void {
    this.toaster.configure({ queue });
  }

  protected setNewestOnTop(newestOnTop: boolean): void {
    this.toaster.configure({ newestOnTop });
  }

  private note(message: string): void {
    this.log.update((lines) => [`${new Date().toLocaleTimeString()}  ${message}`, ...lines].slice(0, 8));
  }
}
