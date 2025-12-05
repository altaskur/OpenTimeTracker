import { signal } from '@angular/core';
import { ElectronApiError } from '../errors/electron-api-error';

/**
 * Base class for database services.
 * Provides error handling and Electron API validation.
 */
export abstract class BaseDatabaseService {
  readonly lastError = signal<ElectronApiError | null>(null);
  readonly isElectronAvailable = signal<boolean>(
    !!globalThis.window?.electronAPI,
  );

  /**
   * Ensures Electron API is available.
   */
  protected ensureElectronApi(operation: string): void {
    if (!globalThis.window?.electronAPI) {
      const error = new ElectronApiError(
        'Electron API not available. Are you running in Electron?',
        operation,
      );
      this.lastError.set(error);
      throw error;
    }
  }

  /**
   * Executes a function with error handling.
   */
  protected async executeWithErrorHandling<T>(
    operation: string,
    fn: () => Promise<T>,
  ): Promise<T> {
    this.lastError.set(null);
    try {
      this.ensureElectronApi(operation);
      return await fn();
    } catch (error) {
      const wrappedError =
        error instanceof ElectronApiError
          ? error
          : new ElectronApiError(`Failed to ${operation}`, operation, error);
      this.lastError.set(wrappedError);
      throw wrappedError;
    }
  }
}
