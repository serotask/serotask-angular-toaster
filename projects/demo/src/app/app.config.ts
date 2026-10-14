import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';

import { provideToaster } from '@serotask/angular-toaster';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    // Global defaults for every toast in the app.
    provideToaster({ position: 'top-right', duration: 4000, theme: 'light', animation: 'slide' }),
  ],
};
