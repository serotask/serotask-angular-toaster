import { EnvironmentProviders, InjectionToken, makeEnvironmentProviders } from '@angular/core';

import { ToasterConfig } from '../models/toaster.types';
import { definedOnly } from '../utils/defined-only';

export const DEFAULT_TOASTER_CONFIG: Required<ToasterConfig> = {
  duration: 4000,
  position: 'top-right',
  showClose: true,
  progressBar: true,
  pauseOnHover: true,
  showIcon: true,
  max: 5,
  preventDuplicates: true,
  queue: true,
  newestOnTop: true,
  rtl: false,
  theme: 'light',
  animation: 'slide',
  type: 'info',
};

/** Application-wide toaster defaults. Provide it with `provideToaster()`. */
export const TOASTER_CONFIG = new InjectionToken<Required<ToasterConfig>>('ST_TOASTER_CONFIG', {
  providedIn: 'root',
  factory: () => ({ ...DEFAULT_TOASTER_CONFIG }),
});

/**
 * Set the default options for every toast in the app.
 *
 * ```ts
 * provideToaster({ position: 'bottom-right', duration: 5000, theme: 'auto' })
 * ```
 */
export function provideToaster(config: ToasterConfig = {}): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: TOASTER_CONFIG,
      useValue: { ...DEFAULT_TOASTER_CONFIG, ...definedOnly(config) },
    },
  ]);
}
