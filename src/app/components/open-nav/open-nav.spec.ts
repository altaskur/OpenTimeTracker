import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Component } from '@angular/core';
import { Router, provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { OpenNavComponent } from './open-nav';

@Component({ template: '', standalone: true })
class StubPageComponent {}

describe('OpenNavComponent', () => {
  let fixture: ComponentFixture<OpenNavComponent>;
  let component: OpenNavComponent;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpenNavComponent, TranslateModule.forRoot()],
      providers: [
        provideRouter([
          { path: '', component: StubPageComponent },
          { path: 'calendar', component: StubPageComponent },
          { path: 'tasks', component: StubPageComponent },
          { path: 'projects', component: StubPageComponent },
          { path: 'history', component: StubPageComponent },
          { path: 'settings/tags', component: StubPageComponent },
          { path: 'settings/statuses', component: StubPageComponent },
        ]),
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(OpenNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render a tab per navigation entry', () => {
    const tabs = fixture.debugElement.queryAll(By.css('.open-nav__tab'));
    expect(tabs.length).toBe(component.tabs.length);
  });

  it('should point tabs at the routes the native menu also drives', () => {
    expect(component.tabs.map((tab) => tab.route)).toEqual([
      '/',
      '/calendar',
      '/tasks',
      '/projects',
    ]);
  });

  it('should mark only the active tab with aria-current', async () => {
    await router.navigateByUrl('/tasks');
    fixture.detectChanges();

    const current = fixture.debugElement.queryAll(
      By.css('.open-nav__tab[aria-current="page"]'),
    );
    expect(current.length).toBe(1);
    expect(current[0].nativeElement.getAttribute('href')).toBe('/tasks');
  });

  it('should not mark home as active on other routes', async () => {
    await router.navigateByUrl('/calendar');
    fixture.detectChanges();

    const home = fixture.debugElement.queryAll(By.css('.open-nav__tab'))[0];
    expect(home.nativeElement.getAttribute('aria-current')).toBeNull();
  });

  it('should keep settings active across its sibling routes', async () => {
    await router.navigateByUrl('/settings/statuses');
    fixture.detectChanges();

    expect(component.settingsActive()).toBeTrue();
  });

  it('should not mark settings active outside the settings group', async () => {
    await router.navigateByUrl('/history');
    fixture.detectChanges();

    expect(component.settingsActive()).toBeFalse();
  });
});
