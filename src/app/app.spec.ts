import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { App } from './app';
import { TranslateModule } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { ActionHistoryService } from './services/action-history.service';
import { UpdateService } from './services/update/update.service';
import { signal } from '@angular/core';

describe('App', () => {
  let mockHistoryService: jasmine.SpyObj<ActionHistoryService>;
  let mockUpdateService: jasmine.SpyObj<UpdateService>;
  let mockElectronAPI: {
    onUndoAction: jasmine.Spy;
    onRedoAction: jasmine.Spy;
  };
  let undoCallback: () => void;
  let redoCallback: () => void;

  beforeEach(async () => {
    mockHistoryService = jasmine.createSpyObj('ActionHistoryService', [
      'undo',
      'redo',
    ]);
    mockHistoryService.undo.and.returnValue(
      Promise.resolve({
        id: '1',
        description: 'Test action undone',
        entityType: 'Project',
        actionType: 'create',
        entityId: 'p1',
        previousData: null,
        newData: {},
        timestamp: new Date(),
        undone: false,
        execute: () => Promise.resolve(),
        undo: () => Promise.resolve(),
      }),
    );
    mockHistoryService.redo.and.returnValue(
      Promise.resolve({
        id: '1',
        description: 'Test action redone',
        entityType: 'Project',
        actionType: 'create',
        entityId: 'p1',
        previousData: null,
        newData: {},
        timestamp: new Date(),
        undone: false,
        execute: () => Promise.resolve(),
        undo: () => Promise.resolve(),
      }),
    );

    // Mock UpdateService with signals
    mockUpdateService = jasmine.createSpyObj('UpdateService', [
      'checkForUpdates',
      'downloadUpdate',
      'installUpdate',
    ]);
    Object.defineProperty(mockUpdateService, 'updateAvailable', {
      get: () => signal(null),
    });
    Object.defineProperty(mockUpdateService, 'downloadProgress', {
      get: () => signal(null),
    });
    Object.defineProperty(mockUpdateService, 'isChecking', {
      get: () => signal(false),
    });
    Object.defineProperty(mockUpdateService, 'isDownloading', {
      get: () => signal(false),
    });
    Object.defineProperty(mockUpdateService, 'updateDownloaded', {
      get: () => signal(false),
    });

    mockElectronAPI = {
      onUndoAction: jasmine
        .createSpy('onUndoAction')
        .and.callFake((cb: () => void) => {
          undoCallback = cb;
        }),
      onRedoAction: jasmine
        .createSpy('onRedoAction')
        .and.callFake((cb: () => void) => {
          redoCallback = cb;
        }),
    };

    (
      window as unknown as { electronAPI?: typeof mockElectronAPI }
    ).electronAPI = mockElectronAPI;

    await TestBed.configureTestingModule({
      imports: [App, TranslateModule.forRoot()],
      providers: [
        MessageService,
        { provide: ActionHistoryService, useValue: mockHistoryService },
        { provide: UpdateService, useValue: mockUpdateService },
      ],
    }).compileComponents();
  });

  afterEach(() => {
    delete (window as unknown as { electronAPI?: typeof mockElectronAPI })
      .electronAPI;
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render app container', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.app-container')).toBeTruthy();
  });

  it('should setup history listeners on init', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    expect(mockElectronAPI.onUndoAction).toHaveBeenCalled();
    expect(mockElectronAPI.onRedoAction).toHaveBeenCalled();
  });

  it('should call undo when undo action triggered', fakeAsync(() => {
    const fixture = TestBed.createComponent(App);
    const messageService = TestBed.inject(MessageService);
    spyOn(messageService, 'add');
    fixture.detectChanges();

    undoCallback();
    tick();

    expect(mockHistoryService.undo).toHaveBeenCalled();
    expect(messageService.add).toHaveBeenCalledWith(
      jasmine.objectContaining({ severity: 'info' }),
    );
  }));

  it('should call redo when redo action triggered', fakeAsync(() => {
    const fixture = TestBed.createComponent(App);
    const messageService = TestBed.inject(MessageService);
    spyOn(messageService, 'add');
    fixture.detectChanges();

    redoCallback();
    tick();

    expect(mockHistoryService.redo).toHaveBeenCalled();
    expect(messageService.add).toHaveBeenCalledWith(
      jasmine.objectContaining({ severity: 'info' }),
    );
  }));

  it('should not show toast when undo returns null', fakeAsync(() => {
    mockHistoryService.undo.and.returnValue(Promise.resolve(null));
    const fixture = TestBed.createComponent(App);
    const messageService = TestBed.inject(MessageService);
    spyOn(messageService, 'add');
    fixture.detectChanges();

    undoCallback();
    tick();

    expect(messageService.add).not.toHaveBeenCalled();
  }));

  it('should not show toast when redo returns null', fakeAsync(() => {
    mockHistoryService.redo.and.returnValue(Promise.resolve(null));
    const fixture = TestBed.createComponent(App);
    const messageService = TestBed.inject(MessageService);
    spyOn(messageService, 'add');
    fixture.detectChanges();

    redoCallback();
    tick();

    expect(messageService.add).not.toHaveBeenCalled();
  }));

  it('should handle download update', async () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    fixture.detectChanges();

    mockUpdateService.downloadUpdate.and.returnValue(Promise.resolve());

    await app.onDownloadUpdate();

    expect(mockUpdateService.downloadUpdate).toHaveBeenCalled();
  });

  it('should handle install update', async () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    fixture.detectChanges();

    mockUpdateService.installUpdate.and.returnValue(Promise.resolve());

    await app.onInstallUpdate();

    expect(mockUpdateService.installUpdate).toHaveBeenCalled();
  });

  it('should close update dialog', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    fixture.detectChanges();

    app.updateDialogVisible.set(true);
    app.onCloseUpdateDialog();

    expect(app.updateDialogVisible()).toBe(false);
  });
});

describe('App without electronAPI', () => {
  beforeEach(async () => {
    delete (window as { electronAPI?: unknown }).electronAPI;

    await TestBed.configureTestingModule({
      imports: [App, TranslateModule.forRoot()],
      providers: [MessageService],
    }).compileComponents();
  });

  it('should create without electron API', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    fixture.detectChanges();
    expect(app).toBeTruthy();
  });
});

describe('App update notifications', () => {
  it('should show notification when update becomes available', fakeAsync(() => {
    const updateSignal = signal<{
      version: string;
      releaseName?: string;
      releaseNotes?: string;
      releaseDate: string;
    } | null>(null);

    const mockUpdateService = jasmine.createSpyObj('UpdateService', [
      'checkForUpdates',
      'downloadUpdate',
      'installUpdate',
    ]);
    Object.defineProperty(mockUpdateService, 'updateAvailable', {
      get: () => updateSignal,
    });
    Object.defineProperty(mockUpdateService, 'downloadProgress', {
      get: () => signal(null),
    });
    Object.defineProperty(mockUpdateService, 'isChecking', {
      get: () => signal(false),
    });
    Object.defineProperty(mockUpdateService, 'isDownloading', {
      get: () => signal(false),
    });
    Object.defineProperty(mockUpdateService, 'updateDownloaded', {
      get: () => signal(false),
    });

    TestBed.configureTestingModule({
      imports: [App, TranslateModule.forRoot()],
      providers: [
        MessageService,
        { provide: UpdateService, useValue: mockUpdateService },
      ],
    });

    const fixture = TestBed.createComponent(App);
    const messageService = TestBed.inject(MessageService);
    spyOn(messageService, 'add');
    fixture.detectChanges();

    // Trigger the effect by setting update info
    updateSignal.set({
      version: '2.0.0',
      releaseName: 'Version 2.0.0',
      releaseNotes: 'New features',
      releaseDate: '2026-02-01',
    });
    fixture.detectChanges();
    tick();

    expect(messageService.add).toHaveBeenCalledWith(
      jasmine.objectContaining({
        severity: 'info',
        sticky: true,
        data: { action: 'viewUpdate' },
      }),
    );
  }));
});
