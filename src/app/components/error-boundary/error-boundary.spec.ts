import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';

import { ErrorBoundaryComponent } from './error-boundary';

/**
 * Test host component for ErrorBoundary
 */
@Component({
  template: `
    <app-error-boundary
      [title]="title"
      [retryable]="retryable"
      (retryClicked)="onRetry()"
    >
      <p class="child-content">Normal Content</p>
    </app-error-boundary>
  `,
  standalone: true,
  imports: [ErrorBoundaryComponent],
})
class TestHostComponent {
  title = 'Test Error Title';
  retryable = true;
  retryCount = 0;

  onRetry(): void {
    this.retryCount++;
  }
}

describe('ErrorBoundaryComponent', () => {
  let component: ErrorBoundaryComponent;
  let fixture: ComponentFixture<ErrorBoundaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErrorBoundaryComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ErrorBoundaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initial state', () => {
    it('should have hasError set to false', () => {
      expect(component.hasError()).toBeFalse();
    });

    it('should have empty errorMessage', () => {
      expect(component.errorMessage()).toBe('');
    });

    it('should have default title', () => {
      expect(component.title()).toBe('Something went wrong');
    });

    it('should have retryable set to true by default', () => {
      expect(component.retryable()).toBeTrue();
    });
  });

  describe('setError', () => {
    it('should set hasError to true', () => {
      component.setError('Test error message');
      expect(component.hasError()).toBeTrue();
    });

    it('should set error message', () => {
      component.setError('Test error message');
      expect(component.errorMessage()).toBe('Test error message');
    });

    it('should display error UI when error is set', () => {
      component.setError('Test error message');
      fixture.detectChanges();

      const errorSection = fixture.debugElement.query(
        By.css('.error-boundary'),
      );
      expect(errorSection).toBeTruthy();
    });

    it('should display error icon', () => {
      component.setError('Error occurred');
      fixture.detectChanges();

      const icon = fixture.debugElement.query(By.css('.error-icon'));
      expect(icon).toBeTruthy();
      expect(icon.nativeElement.classList).toContain('pi-exclamation-triangle');
    });

    it('should display error message in UI', () => {
      component.setError('Custom error message');
      fixture.detectChanges();

      const message = fixture.debugElement.query(By.css('p'));
      expect(message.nativeElement.textContent).toBe('Custom error message');
    });
  });

  describe('clearError', () => {
    beforeEach(() => {
      component.setError('Test error');
      fixture.detectChanges();
    });

    it('should set hasError to false', () => {
      component.clearError();
      expect(component.hasError()).toBeFalse();
    });

    it('should clear error message', () => {
      component.clearError();
      expect(component.errorMessage()).toBe('');
    });

    it('should hide error UI after clearing', () => {
      component.clearError();
      fixture.detectChanges();

      const errorSection = fixture.debugElement.query(
        By.css('.error-boundary'),
      );
      expect(errorSection).toBeNull();
    });
  });

  describe('retry', () => {
    it('should emit retryClicked event', () => {
      spyOn(component.retryClicked, 'emit');
      component.setError('Error');
      fixture.detectChanges();

      component.retry();

      expect(component.retryClicked.emit).toHaveBeenCalled();
    });

    it('should clear error when retry is called', () => {
      component.setError('Error');
      fixture.detectChanges();

      component.retry();

      expect(component.hasError()).toBeFalse();
      expect(component.errorMessage()).toBe('');
    });

    it('should show retry button when retryable is true', () => {
      component.setError('Error');
      fixture.detectChanges();

      const button = fixture.debugElement.query(By.css('p-button'));
      expect(button).toBeTruthy();
    });
  });
});

describe('ErrorBoundaryComponent with host', () => {
  let hostFixture: ComponentFixture<TestHostComponent>;
  let hostComponent: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    hostFixture = TestBed.createComponent(TestHostComponent);
    hostComponent = hostFixture.componentInstance;
    hostFixture.detectChanges();
  });

  it('should display ng-content when no error', () => {
    const content = hostFixture.debugElement.query(By.css('.child-content'));
    expect(content).toBeTruthy();
    expect(content.nativeElement.textContent).toBe('Normal Content');
  });

  it('should hide ng-content when error is set', () => {
    const errorBoundary = hostFixture.debugElement.query(
      By.directive(ErrorBoundaryComponent),
    );
    errorBoundary.componentInstance.setError('Error occurred');
    hostFixture.detectChanges();

    const content = hostFixture.debugElement.query(By.css('.child-content'));
    expect(content).toBeNull();
  });

  it('should use custom title from input', () => {
    const errorBoundary = hostFixture.debugElement.query(
      By.directive(ErrorBoundaryComponent),
    );
    errorBoundary.componentInstance.setError('Error');
    hostFixture.detectChanges();

    const title = hostFixture.debugElement.query(By.css('h3'));
    expect(title.nativeElement.textContent).toBe('Test Error Title');
  });

  it('should emit retry event to host', () => {
    const errorBoundary = hostFixture.debugElement.query(
      By.directive(ErrorBoundaryComponent),
    );
    errorBoundary.componentInstance.setError('Error');
    hostFixture.detectChanges();

    errorBoundary.componentInstance.retry();

    expect(hostComponent.retryCount).toBe(1);
  });

  it('should not show retry button when retryable is false', () => {
    hostComponent.retryable = false;
    hostFixture.detectChanges();

    const errorBoundary = hostFixture.debugElement.query(
      By.directive(ErrorBoundaryComponent),
    );
    errorBoundary.componentInstance.setError('Error');
    hostFixture.detectChanges();

    const button = hostFixture.debugElement.query(By.css('p-button'));
    expect(button).toBeNull();
  });
});
