# Changelog

Versioning follows [SemVer](https://semver.org). Add an entry here before every release.

## 1.0.0

Initial release.

- `st-toaster` container component and `ToasterService` (`success`, `error`, `warning`, `info`, `show`, `remove`, `clear`).
- `provideToaster(config)` / `TOASTER_CONFIG` for app-wide defaults, `ToasterService.configure()` to change them at runtime.
- Six screen positions; toasts are grouped per position.
- Per-toast options: `title`, `duration`, `position`, `showClose`, `progressBar`, `pauseOnHover`, `showIcon`,
  custom `icon`, `action` + `actionHandler`, `cssClass`, `data`.
- Queue (`max`, `queue`), duplicate prevention, `newestOnTop`, persistent toasts (`duration: 0`).
- Hover / keyboard-focus pauses the countdown, and the progress bar pauses with it.
- Themes `light`, `dark`, `auto`; entrance animations `fade`, `slide`, `scale`, `bounce`; RTL support.
- Accessibility: labelled region, `role="alert"` for errors and warnings, `role="status"` otherwise,
  labelled close button, reduced-motion support.
- Built-in SVG icons (no image files), themable through CSS variables.
- SSR-safe (no timers on the server); timers are cleaned up on destroy.
- Unit tests for the service, timer and both components.
