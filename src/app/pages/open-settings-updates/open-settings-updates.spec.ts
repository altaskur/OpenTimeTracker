import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { signal, WritableSignal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MessageService } from 'primeng/api';
import { UpdateService } from '../../services/update/update.service';
import { OpenSettingsUpdatesComponent } from './open-settings-updates';
import { UpdateInfo, UpdateSettings } from '../../../types/electron';

describe('OpenSettingsUpdatesComponent', () => {
  let fixture: ComponentFixture<OpenSettingsUpdatesComponent>;
  let component: OpenSettingsUpdatesComponent;
  let mockUpdateService: jasmine.SpyObj<UpdateService> & {
    updateAvailable: WritableSignal<UpdateInfo | null>;
    isChecking: WritableSignal<boolean>;
    isDownloading: WritableSignal<boolean>;
    downloadProgress: WritableSignal<number>;
    updateDownloaded: WritableSignal<boolean>;
    settings: WritableSignal<UpdateSettings>;
    errorMessage: WritableSignal<string | null>;
  };
  let messageService: MessageService;

  const updateInfo: UpdateInfo = {
    version: '2.0.0',
    releaseName: 'v2',
    releaseNotes: 'notes',
    releaseDate: '2026-02-01',
  };

  beforeEach(async () => {
    mockUpdateService = Object.assign(
      jasmine.createSpyObj<UpdateService>('UpdateService', [
        'getSettings',
        'getAppVersion',
        'setAutoCheck',
        'checkForUpdates',
        'downloadUpdate',
        'installUpdate',
      ]),
      {
        updateAvailable: signal<UpdateInfo | null>(null),
        isChecking: signal<boolean>(false),
        isDownloading: signal<boolean>(false),
        downloadProgress: signal<number>(0),
        updateDownloaded: signal<boolean>(false),
        settings: signal<UpdateSettings>({ autoCheckEnabled: true }),
        errorMessage: signal<string | null>(null),
      },
    );

    mockUpdateService.getSettings.and.returnValue(
      Promise.resolve({ autoCheckEnabled: true }),
    );
    mockUpdateService.getAppVersion.and.returnValue(Promise.resolve('1.2.3'));
    mockUpdateService.setAutoCheck.and.returnValue(Promise.resolve());
    mockUpdateService.checkForUpdates.and.returnValue(Promise.resolve());
    mockUpdateService.downloadUpdate.and.returnValue(Promise.resolve());
    mockUpdateService.installUpdate.and.returnValue(Promise.resolve());

    await TestBed.configureTestingModule({
      imports: [OpenSettingsUpdatesComponent, TranslateModule.forRoot()],
      providers: [
        provideNoopAnimations(),
        { provide: UpdateService, useValue: mockUpdateService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OpenSettingsUpdatesComponent);
    component = fixture.componentInstance;
    messageService = fixture.debugElement.injector.get(MessageService);
    spyOn(messageService, 'add');
  });

  afterEach(() => {
    delete (window as { electronAPI?: unknown }).electronAPI;
  });

  it('should load settings and version on init', fakeAsync(() => {
    fixture.detectChanges();
    tick();

    expect(mockUpdateService.getSettings).toHaveBeenCalled();
    expect(mockUpdateService.getAppVersion).toHaveBeenCalled();
    expect(component.currentVersion()).toBe('1.2.3');
  }));

  it('should fallback to unknown version when getAppVersion fails', fakeAsync(() => {
    mockUpdateService.getAppVersion.and.returnValue(Promise.reject('fail'));

    (
      component as unknown as { loadCurrentVersion: () => Promise<void> }
    ).loadCurrentVersion();
    tick();

    expect(component.currentVersion()).toBe('Unknown');
  }));

  it('should show error toast when loadSettings fails', fakeAsync(() => {
    mockUpdateService.getSettings.and.returnValue(Promise.reject('error'));

    component.loadSettings();
    tick();

    expect(messageService.add).toHaveBeenCalledWith(
      jasmine.objectContaining({ severity: 'error' }),
    );
  }));

  it('should update auto-check and show success toast', fakeAsync(() => {
    component.onAutoCheckToggle(true);
    tick();

    expect(mockUpdateService.setAutoCheck).toHaveBeenCalledWith(true);
    expect(messageService.add).toHaveBeenCalledWith(
      jasmine.objectContaining({ severity: 'success' }),
    );
  }));

  it('should show error toast when auto-check update fails', fakeAsync(() => {
    mockUpdateService.setAutoCheck.and.returnValue(Promise.reject('error'));

    component.onAutoCheckToggle(false);
    tick();

    expect(messageService.add).toHaveBeenCalledWith(
      jasmine.objectContaining({ severity: 'error' }),
    );
  }));

  it('should open dialog when update is available after check', fakeAsync(() => {
    mockUpdateService.updateAvailable.set(updateInfo);

    component.checkForUpdates();
    tick(1000);

    expect(component.dialogVisible()).toBeTrue();
  }));

  it('should show info toast when no updates are available', fakeAsync(() => {
    mockUpdateService.updateAvailable.set(null);
    mockUpdateService.isChecking.set(false);
    mockUpdateService.errorMessage.set(null);

    component.checkForUpdates();
    tick(1000);

    expect(messageService.add).toHaveBeenCalledWith(
      jasmine.objectContaining({ severity: 'info' }),
    );
    expect(component.dialogVisible()).toBeFalse();
  }));

  it('should show error toast when update check fails', fakeAsync(() => {
    mockUpdateService.checkForUpdates.and.returnValue(Promise.reject('error'));

    component.checkForUpdates();
    tick();

    expect(messageService.add).toHaveBeenCalledWith(
      jasmine.objectContaining({ severity: 'error' }),
    );
  }));

  it('should show error toast when download fails', fakeAsync(() => {
    mockUpdateService.downloadUpdate.and.returnValue(Promise.reject('error'));

    component.onDownload();
    tick();

    expect(messageService.add).toHaveBeenCalledWith(
      jasmine.objectContaining({ severity: 'error' }),
    );
  }));

  it('should show error toast when install fails', fakeAsync(() => {
    mockUpdateService.installUpdate.and.returnValue(Promise.reject('error'));

    component.onInstall();
    tick();

    expect(messageService.add).toHaveBeenCalledWith(
      jasmine.objectContaining({ severity: 'error' }),
    );
  }));

  it('should open releases page using electron API when available', async () => {
    const openExternal = jasmine
      .createSpy('openExternal')
      .and.returnValue(Promise.resolve());
    Object.defineProperty(window, 'electronAPI', {
      configurable: true,
      writable: true,
      value: { openExternal },
    });

    await component.openReleasesPage();

    expect(openExternal).toHaveBeenCalledWith(
      'https://github.com/altaskur/OpenTimeTracker/releases',
    );
  });

  it('should fallback to window.open when electron API is not available', () => {
    delete (window as { electronAPI?: unknown }).electronAPI;
    const openSpy = spyOn(window, 'open');

    component.openReleasesPage();

    expect(openSpy).toHaveBeenCalledWith(
      'https://github.com/altaskur/OpenTimeTracker/releases',
      '_blank',
      'noopener,noreferrer',
    );
  });
});
