import {
  Component,
  ChangeDetectionStrategy,
  ContentChild,
  TemplateRef,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { PrimeTemplate } from 'primeng/api';

/**
 * Shared layout component that wraps page content with consistent spacing.
 * Use this component to maintain uniform margins and padding across all pages.
 * Supports a header template using pTemplate="header".
 *
 * @example
 * <app-open-layout>
 *   <ng-template pTemplate="header">
 *     <h1>My Header</h1>
 *   </ng-template>
 *   <p>This content will be wrapped with consistent spacing.</p>
 * </app-open-layout>
 */
@Component({
  selector: 'app-open-layout',
  standalone: true,
  imports: [NgTemplateOutlet],
  templateUrl: './open-layout.html',
  styleUrl: './open-layout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OpenLayoutComponent {
  @ContentChild('header') headerTemplate?: TemplateRef<unknown>;

  @ContentChild(PrimeTemplate) primeTemplate?: PrimeTemplate;

  get header(): TemplateRef<unknown> | null {
    return this.headerTemplate || this.primeTemplate?.template || null;
  }
}
