import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Component } from '@angular/core';
import { Router, provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { OpenSettingsTabsComponent } from './open-settings-tabs';

@Component({ template: '', standalone: true })
class StubPageComponent {}

describe('OpenSettingsTabsComponent', () => {
  let fixture: ComponentFixture<OpenSettingsTabsComponent>;
  let component: OpenSettingsTabsComponent;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpenSettingsTabsComponent, TranslateModule.forRoot()],
      providers: [
        provideRouter([
          { path: 'settings/tags', component: StubPageComponent },
          { path: 'settings/statuses', component: StubPageComponent },
          { path: 'settings/day-types', component: StubPageComponent },
          { path: 'settings/updates', component: StubPageComponent },
        ]),
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(OpenSettingsTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render a tab per settings route', () => {
    const tabs = fixture.debugElement.queryAll(By.css('.settings-tabs__tab'));
    expect(tabs.length).toBe(component.tabs.length);
  });

  it('should cover the four settings routes', () => {
    expect(component.tabs.map((tab) => tab.route)).toEqual([
      '/settings/tags',
      '/settings/statuses',
      '/settings/day-types',
      '/settings/updates',
    ]);
  });

  it('should mark the active tab with aria-selected', async () => {
    await router.navigateByUrl('/settings/statuses');
    fixture.detectChanges();

    const selected = fixture.debugElement.queryAll(
      By.css('.settings-tabs__tab[aria-selected="true"]'),
    );
    expect(selected.length).toBe(1);
    expect(selected[0].nativeElement.getAttribute('href')).toBe(
      '/settings/statuses',
    );
  });
});
