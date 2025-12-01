import { ErrorHandler, Injectable, NgZone, inject } from '@angular/core';
import { MessageService } from 'primeng/api';

/**
 * Global error handler that catches all unhandled errors in the application.
 * Displays user-friendly notifications using PrimeNG Toast.
 */
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private readonly zone = inject(NgZone);
  private readonly messageService = inject(MessageService);

  handleError(error: unknown): void {
    this.zone.run(() => {
      const errorMessage = this.extractErrorMessage(error);

      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: errorMessage,
        life: 5000,
      });
    });
  }

  private extractErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    return 'An unexpected error occurred';
  }
}
