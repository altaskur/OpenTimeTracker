import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ElectronNavigationService } from './electron-navigation.service';

type MockElectronAPI = Pick<Window['electronAPI'], 'onNavigate'>;
type WindowWithOptionalElectronAPI = Omit<Window, 'electronAPI'> & {
  electronAPI?: Partial<Window['electronAPI']>;
};

describe('ElectronNavigationService', () => {
  let service: ElectronNavigationService;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockElectronAPI: MockElectronAPI;
  let navigationCallback: ((route: string) => void) | null = null;

  beforeEach(() => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    // Setup mock electronAPI
    mockElectronAPI = {
      onNavigate: jasmine
        .createSpy('onNavigate')
        .and.callFake((callback: (route: string) => void) => {
          navigationCallback = callback;
        }),
    };

    Object.defineProperty(window, 'electronAPI', {
      writable: true,
      configurable: true,
      value: mockElectronAPI,
    });

    TestBed.configureTestingModule({
      providers: [
        ElectronNavigationService,
        { provide: Router, useValue: mockRouter },
      ],
    });
  });

  afterEach(() => {
    navigationCallback = null;
    delete (window as WindowWithOptionalElectronAPI).electronAPI;
  });

  it('should be created', () => {
    service = TestBed.inject(ElectronNavigationService);
    expect(service).toBeTruthy();
  });

  it('should setup navigation listener on initialization', () => {
    service = TestBed.inject(ElectronNavigationService);
    expect(mockElectronAPI.onNavigate).toHaveBeenCalled();
  });

  it('should navigate when receiving electron navigation event', () => {
    spyOn(console, 'log');
    service = TestBed.inject(ElectronNavigationService);

    // Simulate navigation event from Electron
    if (navigationCallback) {
      navigationCallback('/projects');
    }

    expect(console.log).toHaveBeenCalledWith(
      'Navigation event received from Electron:',
      '/projects',
    );
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/projects']);
  });

  it('should handle multiple navigation events', () => {
    service = TestBed.inject(ElectronNavigationService);

    if (navigationCallback) {
      navigationCallback('/home');
      navigationCallback('/dashboard');
      navigationCallback('/projects');
    }

    expect(mockRouter.navigate).toHaveBeenCalledTimes(3);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/projects']);
  });

  it('should not throw error when electronAPI is not available', () => {
    delete (window as WindowWithOptionalElectronAPI).electronAPI;

    expect(() => {
      service = TestBed.inject(ElectronNavigationService);
    }).not.toThrow();
  });

  it('should not setup listener when onNavigate is not available', () => {
    (window as WindowWithOptionalElectronAPI).electronAPI = {};

    expect(() => {
      service = TestBed.inject(ElectronNavigationService);
    }).not.toThrow();
  });
});
