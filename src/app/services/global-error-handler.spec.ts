import { TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';
import { GlobalErrorHandler } from './global-error-handler';

describe('GlobalErrorHandler', () => {
  let handler: GlobalErrorHandler;
  let messageService: jasmine.SpyObj<MessageService>;

  beforeEach(() => {
    messageService = jasmine.createSpyObj('MessageService', ['add']);

    TestBed.configureTestingModule({
      providers: [
        GlobalErrorHandler,
        { provide: MessageService, useValue: messageService },
      ],
    });

    handler = TestBed.inject(GlobalErrorHandler);
  });

  it('should be created', () => {
    expect(handler).toBeTruthy();
  });

  describe('handleError', () => {
    it('should display error message for Error instance', () => {
      const error = new Error('Test error message');

      handler.handleError(error);

      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Test error message',
        life: 5000,
      });
    });

    it('should display error message for string error', () => {
      handler.handleError('String error message');

      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'String error message',
        life: 5000,
      });
    });

    it('should display default message for unknown error type', () => {
      handler.handleError({ unknown: 'object' });

      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'An unexpected error occurred',
        life: 5000,
      });
    });

    it('should display default message for null error', () => {
      handler.handleError(null);

      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'An unexpected error occurred',
        life: 5000,
      });
    });

    it('should display default message for undefined error', () => {
      handler.handleError(undefined);

      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'An unexpected error occurred',
        life: 5000,
      });
    });
  });
});
