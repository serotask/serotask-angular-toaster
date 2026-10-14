# @serotask/angular-toaster

Modern toast notifications for Angular. Standalone components, Signals, pure CSS animations, zero runtime dependencies.

- 4 types: success, error, warning, info
- 6 positions, grouped on screen
- Queue with `max`, duplicate prevention, persistent toasts
- Hover or keyboard focus pauses the countdown (and the progress bar)
- Action button (for example **Undo**), custom icon, custom CSS class
- Themes `light` / `dark` / `auto`, 4 entrance animations, RTL
- Change settings at runtime with `ToasterService.configure()`
- Accessible (`role="alert"` / `role="status"`) and reduced-motion friendly
- SSR-safe

Requires Angular 20+.

## Install

```bash
npm install @serotask/angular-toaster
```

## Quick start

`app.config.ts`

```ts
import { ApplicationConfig } from '@angular/core';
import { provideToaster } from '@serotask/angular-toaster';

export const appConfig: ApplicationConfig = {
  providers: [provideToaster({ position: 'top-right', duration: 4000, theme: 'auto' })],
};
```

`app.ts` (place it once, in the root component)

```ts
import { Component, inject } from '@angular/core';
import { StToaster, ToasterService } from '@serotask/angular-toaster';

@Component({
  selector: 'app-root',
  imports: [StToaster],
  template: `
    <button (click)="save()">Save</button>
    <st-toaster />
  `,
})
export class App {
  private readonly toaster = inject(ToasterService);

  save(): void {
    this.toaster.success('Saved successfully');
  }
}
```

## Showing toasts

```ts
toaster.success('Saved');                       // message
toaster.error('Upload failed', 'Oops');         // message + title
toaster.warning('Disk almost full', { duration: 8000 });   // message + options
toaster.info('New version available');

const id = toaster.show({ type: 'info', message: 'Hello', title: 'Hi' });
toaster.remove(id);
toaster.clear();                                // removes everything, queue included
```

Every call returns the toast id. If `preventDuplicates` is on and the same toast
(same type, title and message) is already shown or queued, no new toast is created and the id of the existing one is returned.

### Action button

```ts
toaster.success('Item deleted', {
  action: 'Undo',
  actionHandler: () => this.restore(),
  duration: 6000,
});
```

The toast closes after the action is clicked.

### Persistent toast

```ts
const id = toaster.info('Syncing...', { duration: 0 });   // stays until you remove it
// later
toaster.remove(id);
```

## Per-toast options

| Option          | Type              | Default (global) | Description                                       |
| --------------- | ----------------- | ---------------- | ------------------------------------------------- |
| `title`         | `string`          | none             | Heading above the message                         |
| `duration`      | `number` (ms)     | `4000`           | Auto-dismiss time. `0` = stay until closed        |
| `position`      | `ToasterPosition` | `top-right`      | Where the toast appears                           |
| `showClose`     | `boolean`         | `true`           | Close (x) button                                  |
| `progressBar`   | `boolean`         | `true`           | Countdown bar (hidden when `duration` is `0`)     |
| `pauseOnHover`  | `boolean`         | `true`           | Pause on hover / keyboard focus                   |
| `showIcon`      | `boolean`         | `true`           | Show the icon                                     |
| `icon`          | `string`          | none             | URL of a custom icon image                        |
| `action`        | `string`          | none             | Label of the action button                        |
| `actionHandler` | `() => void`      | none             | Called when the action button is clicked          |
| `cssClass`      | `string`          | none             | Extra CSS class(es) on the toast                  |
| `data`          | `unknown`         | none             | Any data you want to keep on the toast            |

Positions: `top-left` `top-center` `top-right` `bottom-left` `bottom-center` `bottom-right`

## Global config

Set once with `provideToaster({...})`. Every per-toast option above can be a global default, plus:

| Option              | Type                                       | Default   | Description                                                   |
| ------------------- | ------------------------------------------ | --------- | ------------------------------------------------------------- |
| `max`               | `number`                                   | `5`       | Max toasts on screen. `0` = unlimited                         |
| `queue`             | `boolean`                                  | `true`    | `true`: extra toasts wait. `false`: the oldest is dropped     |
| `preventDuplicates` | `boolean`                                  | `true`    | Ignore a toast that is already shown or queued                |
| `newestOnTop`       | `boolean`                                  | `true`    | Newest toast first (`false`: newest last)                     |
| `theme`             | `'light' \| 'dark' \| 'auto'`              | `light`   | `auto` follows the system colour scheme                       |
| `animation`         | `'fade' \| 'slide' \| 'scale' \| 'bounce'` | `slide`   | Entrance animation                                            |
| `rtl`               | `boolean`                                  | `false`   | Right-to-left layout                                          |
| `type`              | `ToasterType`                              | `info`    | Type used by `show()` when none is given                      |

Change them later, for example from a dark-mode switch:

```ts
toaster.configure({ theme: 'dark', animation: 'bounce' });
toaster.settings();   // read-only signal with the current settings
```

## ToasterService API

| Member                                      | Description                                              |
| ------------------------------------------- | -------------------------------------------------------- |
| `success()` `error()` `warning()` `info()`  | Show a toast of that type. Returns the id                |
| `show(options)`                             | Show a toast (`message` is required). Returns the id     |
| `remove(id)`                                | Remove one toast (visible or queued)                     |
| `clear()`                                   | Remove all toasts                                        |
| `pause(id)` / `resume(id)`                  | Pause / resume the countdown of one toast                |
| `configure(config)`                         | Change global settings at runtime                        |
| `items`, `settings`                         | Read-only signals                                        |

## Theming

All colours are CSS variables. Set them on `st-toaster` or any parent:

```css
st-toaster {
  --st-toaster-success: #059669;
  --st-toaster-error: #e11d48;
  --st-toaster-warning: #d97706;
  --st-toaster-info: #0284c7;
  --st-toaster-surface: #ffffff;
  --st-toaster-text: #111827;
  --st-toaster-muted: #4b5563;
  --st-toaster-width: 400px;
  --st-toaster-z-index: 20000;
}
```

## Accessibility and SSR

Toasts live in a labelled region. Errors and warnings use `role="alert"`, the rest use `role="status"`.
The countdown pauses while a toast is hovered or has keyboard focus, so people have time to read it.
Animations are turned off under `prefers-reduced-motion`. No timers run on the server.

## License

MIT, see [LICENSE](LICENSE).

## Author

[Satendra Rajput](https://satendra2rajput.com/)