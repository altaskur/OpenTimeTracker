import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, TemplateRef, ViewChild } from '@angular/core';
import { By } from '@angular/platform-browser';
import { PrimeTemplate } from 'primeng/api';

import { OpenLayoutComponent } from './open-layout';

/**
 * Test host component for testing OpenLayoutComponent
 */
@Component({
  template: `
    <app-open-layout>
      <ng-template #header>
        <h1>Test Header</h1>
      </ng-template>
      <p>Test Content</p>
    </app-open-layout>
  `,
  standalone: true,
  imports: [OpenLayoutComponent],
})
class TestHostComponent {
  @ViewChild('header') headerTemplate!: TemplateRef<unknown>;
}

/**
 * Test host component with PrimeTemplate
 */
@Component({
  template: `
    <app-open-layout>
      <ng-template pTemplate="header">
        <h2>Prime Header</h2>
      </ng-template>
      <p>Prime Content</p>
    </app-open-layout>
  `,
  standalone: true,
  imports: [OpenLayoutComponent, PrimeTemplate],
})
class TestHostWithPrimeTemplateComponent {}

/**
 * Test host component without header
 */
@Component({
  template: `
    <app-open-layout>
      <p>Content Only</p>
    </app-open-layout>
  `,
  standalone: true,
  imports: [OpenLayoutComponent],
})
class TestHostNoHeaderComponent {}

describe('OpenLayoutComponent', () => {
  describe('standalone component', () => {
    let component: OpenLayoutComponent;
    let fixture: ComponentFixture<OpenLayoutComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [OpenLayoutComponent],
      }).compileComponents();

      fixture = TestBed.createComponent(OpenLayoutComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should have null header when no template is provided', () => {
      expect(component.header).toBeNull();
    });
  });
});

describe('OpenLayoutComponent with #header template', () => {
  let hostFixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    hostFixture = TestBed.createComponent(TestHostComponent);
    hostFixture.detectChanges();
  });

  it('should render header content', () => {
    const headerElement = hostFixture.debugElement.query(By.css('h1'));
    expect(headerElement).toBeTruthy();
    expect(headerElement.nativeElement.textContent).toBe('Test Header');
  });

  it('should render main content', () => {
    const contentElement = hostFixture.debugElement.query(By.css('p'));
    expect(contentElement).toBeTruthy();
    expect(contentElement.nativeElement.textContent).toBe('Test Content');
  });
});

describe('OpenLayoutComponent with pTemplate', () => {
  let hostFixture: ComponentFixture<TestHostWithPrimeTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostWithPrimeTemplateComponent],
    }).compileComponents();

    hostFixture = TestBed.createComponent(TestHostWithPrimeTemplateComponent);
    hostFixture.detectChanges();
  });

  it('should render prime template header', () => {
    const headerElement = hostFixture.debugElement.query(By.css('h2'));
    expect(headerElement).toBeTruthy();
    expect(headerElement.nativeElement.textContent).toBe('Prime Header');
  });

  it('should render main content with prime template', () => {
    const contentElement = hostFixture.debugElement.query(By.css('p'));
    expect(contentElement).toBeTruthy();
    expect(contentElement.nativeElement.textContent).toBe('Prime Content');
  });
});

describe('OpenLayoutComponent without header', () => {
  let hostFixture: ComponentFixture<TestHostNoHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostNoHeaderComponent],
    }).compileComponents();

    hostFixture = TestBed.createComponent(TestHostNoHeaderComponent);
    hostFixture.detectChanges();
  });

  it('should render content without header', () => {
    const contentElement = hostFixture.debugElement.query(By.css('p'));
    expect(contentElement).toBeTruthy();
    expect(contentElement.nativeElement.textContent).toBe('Content Only');
  });

  it('should not render header element when no template', () => {
    const layoutComponent = hostFixture.debugElement.query(
      By.directive(OpenLayoutComponent),
    );
    expect(layoutComponent.componentInstance.header).toBeNull();
  });
});
