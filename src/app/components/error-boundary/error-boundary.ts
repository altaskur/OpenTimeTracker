import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

/**
 * Reusable error boundary component that displays a fallback UI when an error occurs.
 * Can be used to wrap sections of the application that may fail.
 */
@Component({
  selector: 'app-error-boundary',
  imports: [CommonModule, ButtonModule],
  template: `
    @if (hasError()) {
      <section class="error-boundary" role="alert" aria-live="assertive">
        <article class="error-content">
          <i
            class="pi pi-exclamation-triangle error-icon"
            aria-hidden="true"
          ></i>
          <h3>{{ title() }}</h3>
          <p>{{ errorMessage() }}</p>
          @if (retryable()) {
            <p-button
              label="Try Again"
              icon="pi pi-refresh"
              severity="secondary"
              (onClick)="retry()"
              [attr.aria-label]="'Retry ' + title()"
            />
          }
        </article>
      </section>
    } @else {
      <ng-content />
    }
  `,
  styles: [
    `
      .error-boundary {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 200px;
        padding: 2rem;
        background: var(--surface-ground);
        border-radius: 8px;
        border: 1px solid var(--surface-border);
      }

      .error-content {
        text-align: center;
        max-width: 400px;
      }

      .error-icon {
        font-size: 3rem;
        color: var(--red-500);
        margin-bottom: 1rem;
      }

      h3 {
        margin: 0 0 0.5rem 0;
        color: var(--text-color);
      }

      p {
        margin: 0 0 1.5rem 0;
        color: var(--text-color-secondary);
      }
    `,
  ],
})
export class ErrorBoundaryComponent {
  readonly title = input<string>('Something went wrong');
  readonly retryable = input<boolean>(true);

  readonly retryClicked = output<void>();

  readonly hasError = signal(false);
  readonly errorMessage = signal('');

  setError(message: string): void {
    this.hasError.set(true);
    this.errorMessage.set(message);
  }

  clearError(): void {
    this.hasError.set(false);
    this.errorMessage.set('');
  }

  retry(): void {
    this.clearError();
    this.retryClicked.emit();
  }
}
