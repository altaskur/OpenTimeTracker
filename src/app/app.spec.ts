import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { App } from './app';
import { TranslateModule } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { ActionHistoryService } from './services/action-history.service';
import { UpdateService } from './services/update.service';
import { signal } from '@angular/core';

describe('App', () => {
  let mockHistoryService: jasmine.SpyObj<ActionHistoryService>;
  let mockElectronAPI: {
    onUndoAction: jasmine.Spy;
    onRedoAction: jasmine.Spy;
    checkForUpdates: jasmine.Spy;
  };
  let mockUpdateService: {
    init: jasmine.Spy;
    autoCheck: ReturnType<typeof signal<boolean>>;
    updateAvailable: ReturnType<typeof signal<null>>;
    checking: ReturnType<typeof signal<boolean>>;
  };
  let undoCallback: () => void;
  let redoCallback: () => void;
  let originalElectronAPI: unknown;

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
      checkForUpdates: jasmine
        .createSpy('checkForUpdates')
        .and.returnValue(Promise.resolve({ updateAvailable: false, version: '', url: '' })),
    };

    mockUpdateService = {
      init: jasmine.createSpy('init'),
      autoCheck: signal(true),
      updateAvailable: signal(null),
      checking: signal(false),
    };

    // Save original electronAPI and set mock
    originalElectronAPI = (window as unknown as { electronAPI?: unknown }).electronAPI;
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
    // Restore original electronAPI
    (window as unknown as { electronAPI?: unknown }).electronAPI = originalElectronAPI;
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
});

describe('App without electronAPI', () => {
  let mockUpdateService: {
    init: jasmine.Spy;
    autoCheck: ReturnType<typeof signal<boolean>>;
    updateAvailable: ReturnType<typeof signal<null>>;
    checking: ReturnType<typeof signal<boolean>>;
  };
  let savedElectronAPI: unknown;

  beforeEach(async () => {
    // Save and delete electronAPI for this test suite
    savedElectronAPI = (window as { electronAPI?: unknown }).electronAPI;
    delete (window as { electronAPI?: unknown }).electronAPI;

    mockUpdateService = {
      init: jasmine.createSpy('init'),
      autoCheck: signal(true),
      updateAvailable: signal(null),
      checking: signal(false),
    };

    await TestBed.configureTestingModule({
      imports: [App, TranslateModule.forRoot()],
      providers: [
        MessageService,
        { provide: UpdateService, useValue: mockUpdateService },
      ],
    }).compileComponents();
  });

  afterEach(() => {
    // Restore original electronAPI
    (window as { electronAPI?: unknown }).electronAPI = savedElectronAPI;
  });

  it('should create without electron API', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    fixture.detectChanges();
    expect(app).toBeTruthy();
  });
});
