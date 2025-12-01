/// <reference types="jasmine" />

import { Provider } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { of, BehaviorSubject } from 'rxjs';

/**
 * Creates a mock TranslateService for testing
 */
export function createMockTranslateService(): Partial<TranslateService> {
  return {
    use: jasmine.createSpy('use').and.returnValue(of({})),
    get: jasmine.createSpy('get').and.returnValue(of('')),
    stream: jasmine.createSpy('stream').and.callFake((key: string) => of(key)),
    instant: jasmine.createSpy('instant').and.callFake((key: string) => key),
    setDefaultLang: jasmine.createSpy('setDefaultLang'),
    addLangs: jasmine.createSpy('addLangs'),
    getBrowserLang: jasmine.createSpy('getBrowserLang').and.returnValue('es'),
    onLangChange: new BehaviorSubject({ lang: 'es', translations: {} }),
    onTranslationChange: new BehaviorSubject({ lang: 'es', translations: {} }),
    onDefaultLangChange: new BehaviorSubject({ lang: 'es', translations: {} }),
    currentLang: 'es',
    defaultLang: 'es',
  } as Partial<TranslateService>;
}

/**
 * Provides TranslateService mock for testing
 */
export function provideTranslateTestingModule(): Provider[] {
  return [
    { provide: TranslateService, useFactory: createMockTranslateService },
  ];
}
