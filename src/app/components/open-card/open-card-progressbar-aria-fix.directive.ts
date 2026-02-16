import {
  AfterViewInit,
  Directive,
  ElementRef,
  inject,
  OnDestroy,
} from '@angular/core';

@Directive({
  selector: '[appProgressbarAriaFix]',
  standalone: true,
})
export class OpenCardProgressbarAriaFixDirective
  implements AfterViewInit, OnDestroy
{
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private observer?: MutationObserver;

  ngAfterViewInit(): void {
    this.removeInvalidAriaLevel();

    this.observer = new MutationObserver(() => {
      this.removeInvalidAriaLevel();
    });

    this.observer.observe(this.elementRef.nativeElement, {
      attributes: true,
      attributeFilter: ['aria-level'],
    });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  private removeInvalidAriaLevel(): void {
    const element = this.elementRef.nativeElement;

    if (element.hasAttribute('aria-level')) {
      element.removeAttribute('aria-level');
    }
  }
}
