import {TestBed} from '@angular/core/testing';
import {provideRouter} from '@angular/router';
import {RouterTestingHarness} from '@angular/router/testing';
import {appRoutes} from './app.routes';

describe('App', () => {
  it('should render title', async () => {
    await TestBed.configureTestingModule({
      providers: [provideRouter(appRoutes)],
    }).compileComponents();

    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/');

    const compiled = harness.routeNativeElement as HTMLElement | null;
    expect(compiled?.querySelector('h1')?.textContent).toContain(
      'Welcome to the APTCO AI Starter for Angular!',
    );
  });
});
