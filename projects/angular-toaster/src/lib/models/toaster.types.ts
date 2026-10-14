export type ToasterType = 'success' | 'error' | 'warning' | 'info';

export type ToasterPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export type ToasterTheme = 'light' | 'dark' | 'auto';

export type ToasterAnimation = 'fade' | 'slide' | 'scale' | 'bounce';

/**
 * Options for a single toast. Anything you leave out falls back to the global config.
 */
export interface ToasterOptions {
  /** Bold heading above the message. */
  title?: string;
  /** Auto-dismiss time in ms. `0` keeps the toast until it is closed. */
  duration?: number;
  position?: ToasterPosition;
  /** Show the close (x) button. */
  showClose?: boolean;
  /** Show the countdown bar. Ignored when `duration` is `0`. */
  progressBar?: boolean;
  /** Pause the countdown while the toast is hovered or focused. */
  pauseOnHover?: boolean;
  /** Show the icon. */
  showIcon?: boolean;
  /** URL of a custom icon image (replaces the built-in icon). */
  icon?: string;
  /** Label of an action button, e.g. `'Undo'`. */
  action?: string;
  /** Called when the action button is clicked. The toast closes afterwards. */
  actionHandler?: () => void;
  /** Extra CSS class(es) added to the toast. */
  cssClass?: string;
  /** Any data you want to keep on the toast. */
  data?: unknown;
}

/** Options for `ToasterService.show()`. */
export interface ToasterShowOptions extends ToasterOptions {
  message: string;
  /** Defaults to the `type` of the global config. */
  type?: ToasterType;
}

/**
 * Global defaults. Set them with `provideToaster()` or change them later with
 * `ToasterService.configure()`.
 */
export interface ToasterConfig {
  duration?: number;
  position?: ToasterPosition;
  showClose?: boolean;
  progressBar?: boolean;
  pauseOnHover?: boolean;
  showIcon?: boolean;
  /** Maximum toasts on screen at once. `0` = unlimited. */
  max?: number;
  /** Ignore a toast when the same type + title + message is already shown or queued. */
  preventDuplicates?: boolean;
  /** `true`: extra toasts wait in a queue. `false`: the oldest visible toast is dropped. */
  queue?: boolean;
  /** `true`: newest toast first. `false`: newest toast last. */
  newestOnTop?: boolean;
  /** Right-to-left layout. */
  rtl?: boolean;
  theme?: ToasterTheme;
  /** Entrance animation. */
  animation?: ToasterAnimation;
  /** Type used by `show()` when none is given. */
  type?: ToasterType;
}

/** A toast that is on screen (or waiting in the queue). */
export interface ToasterItem {
  id: string;
  title?: string;
  message: string;
  type: ToasterType;
  duration: number;
  position: ToasterPosition;
  showClose: boolean;
  progressBar: boolean;
  pauseOnHover: boolean;
  showIcon: boolean;
  icon?: string;
  action?: string;
  actionHandler?: () => void;
  cssClass?: string;
  data?: unknown;
  createdAt: number;
}
