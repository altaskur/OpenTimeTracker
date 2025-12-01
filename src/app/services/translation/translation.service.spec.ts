import { TestBed } from '@angular/core/testing';
import { TranslationService } from './translation.service';
import { TranslateService } from '@ngx-translate/core';

describe('TranslationService', () => {
  let service: TranslationService;
  let translateService: jasmine.SpyObj<TranslateService>;
  let originalElectronAPI: unknown;

  beforeEach(() => {
    translateService = jasmine.createSpyObj('TranslateService', [
      'addLangs',
      'setFallbackLang',
      'use',
      'getCurrentLang',
      'instant',
    ]);
    translateService.getCurrentLang.and.returnValue('es');
    translateService.instant.and.callFake((key: string) => key);

    originalElectronAPI = window.electronAPI;

    TestBed.configureTestingModule({
      providers: [
        TranslationService,
        { provide: TranslateService, useValue: translateService },
      ],
    });

    service = TestBed.inject(TranslationService);
  });

  afterEach(() => {
    window.electronAPI = originalElectronAPI as typeof window.electronAPI;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('init', () => {
    it('should add languages and set fallback', async () => {
      await service.init();

      expect(translateService.addLangs).toHaveBeenCalledWith(['es', 'en']);
      expect(translateService.setFallbackLang).toHaveBeenCalledWith('es');
    });

    it('should use es when electronAPI is not available', async () => {
      delete (window as { electronAPI?: unknown }).electronAPI;

      await service.init();

      expect(translateService.use).toHaveBeenCalledWith('es');
    });

    it('should get language from Electron when available', async () => {
      window.electronAPI = {
        getLanguage: jasmine.createSpy('getLanguage').and.resolveTo('en'),
        onLanguageChange: jasmine.createSpy('onLanguageChange'),
      } as unknown as typeof window.electronAPI;

      await service.init();

      expect(window.electronAPI?.getLanguage).toHaveBeenCalled();
      expect(translateService.use).toHaveBeenCalledWith('en');
    });

    it('should register language change listener', async () => {
      window.electronAPI = {
        getLanguage: jasmine.createSpy('getLanguage').and.resolveTo('es'),
        onLanguageChange: jasmine.createSpy('onLanguageChange'),
      } as unknown as typeof window.electronAPI;

      await service.init();

      expect(window.electronAPI?.onLanguageChange).toHaveBeenCalled();
    });

    it('should use es on electron error', async () => {
      window.electronAPI = {
        getLanguage: jasmine
          .createSpy('getLanguage')
          .and.rejectWith(new Error('Error')),
        onLanguageChange: jasmine.createSpy('onLanguageChange'),
      } as unknown as typeof window.electronAPI;

      await service.init();

      expect(translateService.use).toHaveBeenCalledWith('es');
    });
  });

  describe('getCurrentLanguage', () => {
    it('should return current language', () => {
      translateService.getCurrentLang.and.returnValue('en');

      const result = service.getCurrentLanguage();

      expect(result).toBe('en');
    });

    it('should return es when no language is set', () => {
      translateService.getCurrentLang.and.returnValue('');

      const result = service.getCurrentLanguage();

      expect(result).toBe('es');
    });
  });

  describe('setLanguage', () => {
    it('should use translate service', () => {
      delete (window as { electronAPI?: unknown }).electronAPI;

      service.setLanguage('en');

      expect(translateService.use).toHaveBeenCalledWith('en');
    });

    it('should call electron API when available', () => {
      window.electronAPI = {
        setLanguage: jasmine.createSpy('setLanguage'),
      } as unknown as typeof window.electronAPI;

      service.setLanguage('en');

      expect(window.electronAPI?.setLanguage).toHaveBeenCalledWith('en');
    });
  });

  describe('instant', () => {
    it('should return translation for key', () => {
      translateService.instant.and.returnValue('Translated');

      const result = service.instant('test.key');

      expect(result).toBe('Translated');
      expect(translateService.instant).toHaveBeenCalledWith('test.key');
    });
  });
});
