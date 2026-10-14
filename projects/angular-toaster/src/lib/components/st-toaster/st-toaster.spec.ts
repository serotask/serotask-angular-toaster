import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideToaster } from '../../config/toaster.config';
import { ToasterConfig } from '../../models/toaster.types';
import { ToasterService } from '../../services/toaster.service';
import { StToaster } from './st-toaster';

describe('StToaster', () => {
  let fixture: ComponentFixture<StToaster>;
  let toaster: ToasterService;
  let element: HTMLElement;

  async function setup(config: ToasterConfig = {}): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [StToaster],
      providers: [provideToaster({ duration: 0, ...config })],
    }).compileComponents();

    fixture = TestBed.createComponent(StToaster);
    toaster = TestBed.inject(ToasterService);
    element = fixture.nativeElement as HTMLElement;
  }

  it('renders nothing when there are no toasts', async () => {
    await setup();
    fixture.detectChanges();

    expect(element.querySelector('st-toaster-item')).toBeNull();
  });

  it('renders a toast created through the service', async () => {
    await setup();

    toaster.success('Saved', 'Done');
    fixture.detectChanges();

    expect(element.querySelectorAll('st-toaster-item')).toHaveLength(1);
    expect(element.textContent).toContain('Saved');
    expect(element.textContent).toContain('Done');
  });

  it('groups toasts by position', async () => {
    await setup();

    toaster.info('a', { position: 'top-right' });
    toaster.info('b', { position: 'top-right' });
    toaster.info('c', { position: 'bottom-left' });
    fixture.detectChanges();

    expect(element.querySelectorAll('.st-toaster__stack')).toHaveLength(2);
    expect(element.querySelectorAll('.st-toaster__stack--top-right st-toaster-item')).toHaveLength(2);
    expect(element.querySelectorAll('.st-toaster__stack--bottom-left st-toaster-item')).toHaveLength(1);
  });

  it('removes a toast from the screen when it is closed', async () => {
    await setup();

    toaster.info('Bye');
    fixture.detectChanges();

    (element.querySelector('.st-toaster-item__close') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(toaster.items()).toHaveLength(0);
    expect(element.querySelector('st-toaster-item')).toBeNull();
  });

  it('applies the theme class and follows runtime changes', async () => {
    await setup({ theme: 'dark' });
    fixture.detectChanges();

    const root = element.querySelector('.st-toaster') as HTMLElement;
    expect(root.classList).toContain('st-toaster--dark');

    toaster.configure({ theme: 'auto' });
    fixture.detectChanges();
    expect(root.classList).toContain('st-toaster--auto');
  });

  it('sets dir="rtl" when rtl is on', async () => {
    await setup({ rtl: true });
    fixture.detectChanges();

    expect(element.querySelector('.st-toaster')?.getAttribute('dir')).toBe('rtl');
  });

  it('is a labelled region for assistive technology', async () => {
    await setup();
    fixture.detectChanges();

    const root = element.querySelector('.st-toaster');
    expect(root?.getAttribute('role')).toBe('region');
    expect(root?.getAttribute('aria-label')).toBe('Notifications');
  });
});
