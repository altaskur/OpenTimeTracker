import { Component, ChangeDetectionStrategy } from '@angular/core';

/**
 * Shared layout component that wraps page content with consistent spacing.
 * Use this component to maintain uniform margins and padding across all pages.
 *
 * @example
 * <app-open-layout>
 *   <h1>My Page Content</h1>
 *   <p>This content will be wrapped with consistent spacing.</p>
 * </app-open-layout>
 */
@Component({
  selector: 'app-open-layout',
  standalone: true,
  templateUrl: './open-layout.html',
  styleUrl: './open-layout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OpenLayoutComponent {}
