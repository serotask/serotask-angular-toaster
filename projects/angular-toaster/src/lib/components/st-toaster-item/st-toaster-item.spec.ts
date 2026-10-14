import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideToaster } from '../../config/toaster.config';
import { ToasterItem } from '../../models/toaster.types';
import { ToasterService } from '../../services/toaster.service';
import { StToasterItem } from './st-toaster-item';

function makeItem(overrides: Partial<ToasterItem> = {}): ToasterItem {
  return {
    id: 'toast-1',
    message: 'Saved successfully',
    type: 'success',
    duration: 4000,
    position: 'top-right',
    showClose: true,
    progressBar: true,
    pauseOnHover: true,
    showIcon: true,
    createdAt: 0,
    ...overrides,
  };
}

describe('StToasterItem', () => {
  let fixture: ComponentFixture<StToasterItem>;
  let element: HTMLElement;

  function render(overrides: Partial<ToasterItem> = {}): void {
    fixture.componentRef.setInput('item', makeItem(overrides));
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StToasterItem],
      providers: [provideToaster()],
    }).compileComponents();

    fixture = TestBed.createComponent(StToasterItem);
    element = fixture.nativeElement as HTMLElement;
  });

  it('renders message and title', () => {
    render({ title: 'Done' });

    expect(element.textContent).toContain('Saved successfully');
    expect(element.querySelector('.st-toaster-item__title')?.textContent).toContain('Done');
  });

  it('has no title element without a title', () => {
    render();

    expect(element.querySelector('.st-toaster-item__title')).toBeNull();
  });

  it('applies the type class and the animation class', () => {
    render({ type: 'error' });

    const root = element.querySelector('.st-toaster-item') as HTMLElement;
    expect(root.classList).toContain('st-toaster-item--error');
    expect(root.classList).toContain('st-toaster-item--anim-slide');
  });

  it('adds a custom css class', () => {
    render({ cssClass: 'my-toast' });

    expect((element.querySelector('.st-toaster-item') as HTMLElement).classList).toContain('my-toast');
  });

  it('uses role="alert" for errors and warnings, role="status" otherwise', () => {
    render({ type: 'error' });
    expect(element.querySelector('.st-toaster-item')?.getAttribute('role')).toBe('alert');

    render({ type: 'warning' });
    expect(element.querySelector('.st-toaster-item')?.getAttribute('role')).toBe('alert');

    render({ type: 'info' });
    expect(element.querySelector('.st-toaster-item')?.getAttribute('role')).toBe('status');
  });

  it('shows a different built-in icon per type, and none when showIcon is false', () => {
    render({ type: 'success' });
    const success = element.querySelector('svg path')?.getAttribute('d');

    render({ type: 'warning' });
    const warning = element.querySelector('svg path')?.getAttribute('d');

    expect(success).toBeTruthy();
    expect(warning).toBeTruthy();
    expect(warning).not.toBe(success);

    render({ showIcon: false });
    expect(element.querySelector('.st-toaster-item__icon')).toBeNull();
  });

  it('shows a custom icon image instead of the built-in icon', () => {
    render({ icon: '/assets/icon.png' });

    expect(element.querySelector('svg')).toBeNull();
    expect(element.querySelector('img')?.getAttribute('src')).toBe('/assets/icon.png');
  });

  it('the close button emits the toast id', () => {
    const dismissed = vi.fn();
    fixture.componentInstance.dismissed.subscribe(dismissed);
    render();

    (element.querySelector('.st-toaster-item__close') as HTMLButtonElement).click();

    expect(dismissed).toHaveBeenCalledWith('toast-1');
  });

  it('hides the close button when showClose is false', () => {
    render({ showClose: false });

    expect(element.querySelector('.st-toaster-item__close')).toBeNull();
  });

  it('the action button runs the handler and then closes the toast', () => {
    const handler = vi.fn();
    const dismissed = vi.fn();
    fixture.componentInstance.dismissed.subscribe(dismissed);
    render({ action: 'Undo', actionHandler: handler });

    (element.querySelector('.st-toaster-item__action') as HTMLButtonElement).click();

    expect(handler).toHaveBeenCalledTimes(1);
    expect(dismissed).toHaveBeenCalledWith('toast-1');
  });

  it('shows the progress bar only when it is enabled and the toast auto-closes', () => {
    render();
    expect(element.querySelector('.st-toaster-item__progress')).not.toBeNull();

    render({ progressBar: false });
    expect(element.querySelector('.st-toaster-item__progress')).toBeNull();

    render({ duration: 0 });
    expect(element.querySelector('.st-toaster-item__progress')).toBeNull();
  });

  it('pauses the countdown on hover and resumes on leave', () => {
    const toaster = TestBed.inject(ToasterService);
    const pause = vi.spyOn(toaster, 'pause');
    const resume = vi.spyOn(toaster, 'resume');
    render();

    const root = element.querySelector('.st-toaster-item') as HTMLElement;

    root.dispatchEvent(new Event('mouseenter'));
    fixture.detectChanges();
    expect(pause).toHaveBeenCalledWith('toast-1');
    expect(element.querySelector('.st-toaster-item__progress--paused')).not.toBeNull();

    root.dispatchEvent(new Event('mouseleave'));
    fixture.detectChanges();
    expect(resume).toHaveBeenCalledWith('toast-1');
    expect(element.querySelector('.st-toaster-item__progress--paused')).toBeNull();
  });

  it('does not pause when pauseOnHover is false', () => {
    const toaster = TestBed.inject(ToasterService);
    const pause = vi.spyOn(toaster, 'pause');
    render({ pauseOnHover: false });

    (element.querySelector('.st-toaster-item') as HTMLElement).dispatchEvent(new Event('mouseenter'));

    expect(pause).not.toHaveBeenCalled();
  });
});
