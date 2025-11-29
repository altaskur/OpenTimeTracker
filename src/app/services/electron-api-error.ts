/**
 * Custom error class for Electron API related errors.
 * Provides structured error information for better debugging and user feedback.
 */
export class ElectronApiError extends Error {
  constructor(
    message: string,
    public readonly operation: string,
    public readonly originalError?: unknown,
  ) {
    super(message);
    this.name = 'ElectronApiError';
  }

  toUserMessage(): string {
    return `Failed to ${this.operation}. Please try again.`;
  }
}
