import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;
  let mockHtmlElement: HTMLElement;
  let originalElectronAPI: unknown;

  beforeEach(() => {
    mockHtmlElement = document.createElement('html');
    spyOn(document, 'querySelector').and.returnValue(mockHtmlElement);
    spyOn(localStorage, 'getItem').and.returnValue(null);
    spyOn(localStorage, 'setItem');

    originalElectronAPI = window.electronAPI;

    TestBed.configureTestingModule({
      providers: [ThemeService],
    });

    service = TestBed.inject(ThemeService);
  });

  afterEach(() => {
    window.electronAPI = originalElectronAPI as typeof window.electronAPI;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('init', () => {
    it('should initialize only once', async () => {
      await service.init();
      await service.init();

      expect(service.isDarkMode()).toBeDefined();
    });

    it('should get theme from Electron when available', async () => {
      window.electronAPI = {
        getTheme: jasmine.createSpy('getTheme').and.resolveTo(false),
        onThemeChange: jasmine.createSpy('onThemeChange'),
      } as unknown as typeof window.electronAPI;

      await service.init();

      expect(window.electronAPI?.getTheme).toHaveBeenCalled();
    });

    it('should apply dark theme on Electron error', async () => {
      window.electronAPI = {
        getTheme: jasmine
          .createSpy('getTheme')
          .and.rejectWith(new Error('Error')),
        onThemeChange: jasmine.createSpy('onThemeChange'),
      } as unknown as typeof window.electronAPI;

      await service.init();

      expect(service.isDarkMode()).toBe(true);
    });

    it('should use localStorage when Electron is not available', async () => {
      delete (window as { electronAPI?: unknown }).electronAPI;
      (localStorage.getItem as jasmine.Spy).and.returnValue('light');

      await service.init();

      expect(localStorage.getItem).toHaveBeenCalledWith('theme');
    });
  });

  describe('toggleTheme', () => {
    it('should call Electron API when available', () => {
      window.electronAPI = {
        toggleTheme: jasmine.createSpy('toggleTheme'),
        onThemeChange: jasmine.createSpy('onThemeChange'),
      } as unknown as typeof window.electronAPI;

      service.toggleTheme();

      expect(window.electronAPI?.toggleTheme).toHaveBeenCalled();
    });

    it('should toggle locally when Electron is not available', () => {
      delete (window as { electronAPI?: unknown }).electronAPI;

      const initialMode = service.isDarkMode();
      service.toggleTheme();

      expect(service.isDarkMode()).toBe(!initialMode);
    });
  });

  describe('getThemeLabel', () => {
    it('should return Modo Claro when dark mode is on', () => {
      service['applyTheme'](true);

      expect(service.getThemeLabel()).toBe('Modo Claro');
    });

    it('should return Modo Oscuro when dark mode is off', () => {
      service['applyTheme'](false);

      expect(service.getThemeLabel()).toBe('Modo Oscuro');
    });
  });

  describe('getThemeIcon', () => {
    it('should return sun icon when dark mode is on', () => {
      service['applyTheme'](true);

      expect(service.getThemeIcon()).toBe('pi pi-sun');
    });

    it('should return moon icon when dark mode is off', () => {
      service['applyTheme'](false);

      expect(service.getThemeIcon()).toBe('pi pi-moon');
    });
  });

  describe('applyTheme', () => {
    it('should add dark class and save to localStorage when dark', () => {
      service['applyTheme'](true);

      expect(mockHtmlElement.classList.contains('my-app-dark')).toBe(true);
      expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
    });

    it('should remove dark class and save to localStorage when light', () => {
      mockHtmlElement.classList.add('my-app-dark');

      service['applyTheme'](false);

      expect(mockHtmlElement.classList.contains('my-app-dark')).toBe(false);
      expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'light');
    });
  });

  describe('listenToElectronThemeChanges', () => {
    it('should register theme change listener when available', () => {
      const mockOnThemeChange = jasmine.createSpy('onThemeChange');
      window.electronAPI = {
        onThemeChange: mockOnThemeChange,
      } as unknown as typeof window.electronAPI;

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [ThemeService],
      });
      TestBed.inject(ThemeService);

      expect(mockOnThemeChange).toHaveBeenCalled();
    });
  });
});
