/// <reference types="jasmine" />

import { Provider } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

/**
 * Creates a mock TranslateService for testing
 */
export function createMockTranslateService(): jasmine.SpyObj<TranslateService> {
  const spy = jasmine.createSpyObj('TranslateService', [
    'use',
    'get',
    'instant',
    'setDefaultLang',
    'addLangs',
    'getBrowserLang',
  ]);

  spy.use.and.returnValue(of({}));
  spy.get.and.returnValue(of(''));
  spy.instant.and.callFake((key: string) => key);
  spy.setDefaultLang.and.returnValue(of({}));
  spy.addLangs.and.returnValue(undefined);
  spy.getBrowserLang.and.returnValue('es');

  return spy;
}

/**
 * Provides TranslateService mock for testing
 */
export function provideTranslateTestingModule(): Provider[] {
  return [
    { provide: TranslateService, useFactory: createMockTranslateService },
  ];
}
