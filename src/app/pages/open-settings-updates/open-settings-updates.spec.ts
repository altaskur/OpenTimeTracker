import { provideRouter } from '@angular/router';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { OpenSettingsUpdatesComponent } from './open-settings-updates';
import { UpdateService } from '../../services/update.service';
import { MessageService } from 'primeng/api';
import { signal } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';

describe('OpenSettingsUpdatesComponent', () => {
  let component: OpenSettingsUpdatesComponent;
  let fixture: ComponentFixture<OpenSettingsUpdatesComponent>;
  let updateServiceMock: Partial<UpdateService> & {
    toggleAutoCheck: jasmine.Spy;
    checkForUpdates: jasmine.Spy;
    openDownloadPage: jasmine.Spy;
    getReleaseByTag: jasmine.Spy;
  };
  let originalElectronAPI: unknown;

  beforeEach(async () => {
    updateServiceMock = {
      autoCheck: signal(true),
      updateAvailable: signal(null),
      checking: signal(false),
      toggleAutoCheck: jasmine.createSpy('toggleAutoCheck'),
      checkForUpdates: jasmine
        .createSpy('checkForUpdates')
        .and.returnValue(Promise.resolve(null)),
      openDownloadPage: jasmine.createSpy('openDownloadPage'),
      getReleaseByTag: jasmine.createSpy('getReleaseByTag').and.returnValue(
        Promise.resolve({
          tag_name: 'v1.0.0',
          html_url: 'https://example.com/releases/v1.0.0',
          body: 'Release notes',
          name: 'Release v1.0.0',
          published_at: '2023-01-01T00:00:00Z',
        }),
      ),
      lastChecked: signal(null),
    };

    // Save original electronAPI and mock
    originalElectronAPI = (window as unknown as { electronAPI?: unknown })
      .electronAPI;
    (
      window as unknown as { electronAPI: { getVersion: jasmine.Spy } }
    ).electronAPI = {
      getVersion: jasmine
        .createSpy('getVersion')
        .and.returnValue(Promise.resolve('1.0.0')),
    };

    await TestBed.configureTestingModule({
      imports: [OpenSettingsUpdatesComponent, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        { provide: UpdateService, useValue: updateServiceMock },
        MessageService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OpenSettingsUpdatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    // Restore original electronAPI
    (window as unknown as { electronAPI?: unknown }).electronAPI =
      originalElectronAPI;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle auto check', () => {
    component.updateService.toggleAutoCheck(false);
    expect(updateServiceMock.toggleAutoCheck).toHaveBeenCalledWith(false);
  });

  it('should call checkNow', async () => {
    await component.checkNow();
    expect(updateServiceMock.checkForUpdates).toHaveBeenCalledWith(true);
  });

  it('should fetch current version on init', async () => {
    await fixture.whenStable();
    expect(component.currentVersion).toBe('1.0.0');
  });

  it('should fetch release notes for current version', async () => {
    await fixture.whenStable();
    expect(updateServiceMock.getReleaseByTag).toHaveBeenCalledWith('v1.0.0');
    expect(component.currentVersionReleaseNotes).toBe('Release notes');
  });

  it('should handle version already starting with v', async () => {
    (
      window as unknown as { electronAPI: { getVersion: jasmine.Spy } }
    ).electronAPI.getVersion.and.returnValue(Promise.resolve('v2.0.0'));

    await component.ngOnInit();
    await fixture.whenStable();

    expect(updateServiceMock.getReleaseByTag).toHaveBeenCalledWith('v2.0.0');
  });

  it('should set lastCheckResult after checkNow', async () => {
    const mockResult = { updateAvailable: false, version: '1.0.0', url: '' };
    updateServiceMock.checkForUpdates.and.returnValue(
      Promise.resolve(mockResult),
    );

    await component.checkNow();

    expect(component.lastCheckResult).toEqual(mockResult);
  });

  it('should reset lastCheckResult before check', async () => {
    component.lastCheckResult = {
      updateAvailable: true,
      version: '2.0.0',
      url: 'url',
    };
    updateServiceMock.checkForUpdates.and.returnValue(Promise.resolve(null));

    await component.checkNow();

    expect(component.lastCheckResult).toBeNull();
  });

  it('should call openDownloadPage', () => {
    component.handleDownload();
    expect(updateServiceMock.openDownloadPage).toHaveBeenCalled();
  });

  it('should open GitHub releases via electronAPI if available', () => {
    const event = new Event('click');
    spyOn(event, 'preventDefault');
    const mockElectronAPI = {
      openExternal: jasmine.createSpy('openExternal'),
    };
    (window as unknown as { electronAPI: typeof mockElectronAPI }).electronAPI =
      mockElectronAPI;

    component.openGitHubReleases(event);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(mockElectronAPI.openExternal).toHaveBeenCalledWith(
      'https://github.com/altaskur/OpenTimeTracker/releases',
    );
  });

  it('should open GitHub releases via window.open if electronAPI is not available', () => {
    const event = new Event('click');
    spyOn(event, 'preventDefault');
    const win = window as unknown as { electronAPI?: unknown };
    const originalElectronAPI = win.electronAPI;
    delete win.electronAPI;
    spyOn(window, 'open');

    component.openGitHubReleases(event);

    expect(window.open).toHaveBeenCalledWith(
      'https://github.com/altaskur/OpenTimeTracker/releases',
      '_blank',
      'noopener',
    );

    // Restore
    win.electronAPI = originalElectronAPI;
  });

  it('should show current version notes', fakeAsync(() => {
    component.currentVersionReleaseNotes = null;
    updateServiceMock.getReleaseByTag.and.returnValue(
      Promise.resolve({
        tag_name: 'v1.0.0',
        html_url: 'url',
        body: 'Notes',
        name: 'Name',
        published_at: 'date',
      }),
    );

    component.showCurrentVersionNotes();
    tick();

    expect(component.currentVersionDialogVisible).toBeTrue();
    expect(updateServiceMock.getReleaseByTag).toHaveBeenCalled();
  }));
});

describe('OpenSettingsUpdatesComponent without release notes', () => {
  let component: OpenSettingsUpdatesComponent;
  let fixture: ComponentFixture<OpenSettingsUpdatesComponent>;
  let updateServiceMock: Partial<UpdateService> & {
    toggleAutoCheck: jasmine.Spy;
    checkForUpdates: jasmine.Spy;
    openDownloadPage: jasmine.Spy;
    getReleaseByTag: jasmine.Spy;
  };
  let originalElectronAPI: unknown;

  beforeEach(async () => {
    updateServiceMock = {
      autoCheck: signal(true),
      updateAvailable: signal(null),
      checking: signal(false),
      toggleAutoCheck: jasmine.createSpy('toggleAutoCheck'),
      checkForUpdates: jasmine
        .createSpy('checkForUpdates')
        .and.returnValue(Promise.resolve(null)),
      openDownloadPage: jasmine.createSpy('openDownloadPage'),
      getReleaseByTag: jasmine
        .createSpy('getReleaseByTag')
        .and.returnValue(Promise.resolve(null)),
      lastChecked: signal(null),
    };

    originalElectronAPI = (window as unknown as { electronAPI?: unknown })
      .electronAPI;
    (
      window as unknown as { electronAPI: { getVersion: jasmine.Spy } }
    ).electronAPI = {
      getVersion: jasmine
        .createSpy('getVersion')
        .and.returnValue(Promise.resolve('1.0.0')),
    };

    await TestBed.configureTestingModule({
      imports: [OpenSettingsUpdatesComponent, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        { provide: UpdateService, useValue: updateServiceMock },
        MessageService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OpenSettingsUpdatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    (window as unknown as { electronAPI?: unknown }).electronAPI =
      originalElectronAPI;
  });

  it('should handle null release notes gracefully', async () => {
    await fixture.whenStable();
    expect(component.currentVersionReleaseNotes).toBeNull();
  });
});
