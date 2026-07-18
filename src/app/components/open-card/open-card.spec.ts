import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OpenCard } from './open-card';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

describe('OpenCard', () => {
  let component: OpenCard;
  let fixture: ComponentFixture<OpenCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpenCard],
      providers: [provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(OpenCard);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Project Variant', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('variant', 'project');
      fixture.componentRef.setInput('icon', 'pi-folder');
      fixture.componentRef.setInput('title', 'Test Project');
      fixture.detectChanges();
    });

    it('should render project card', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.open-card--project')).toBeTruthy();
    });

    it('should display project title', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const nameElement = compiled.querySelector('.open-card__name');
      expect(nameElement?.textContent?.trim()).toBe('Test Project');
    });

    it('should display project icon', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const iconElement = compiled.querySelector('.pi-folder');
      expect(iconElement).toBeTruthy();
    });
  });

  describe('Stats Time Variant', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('variant', 'stats-time');
      fixture.componentRef.setInput('statsModifier', 'today');
      fixture.componentRef.setInput('icon', 'pi-sun');
      fixture.componentRef.setInput('iconLabel', 'Today');
      fixture.componentRef.setInput('worked', '4:30');
      fixture.componentRef.setInput('target', '8:00');
      fixture.componentRef.setInput('remaining', '3:30');
      fixture.componentRef.setInput('progress', 56);
      fixture.detectChanges();
    });

    it('should render stats-time card', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.open-card--stats-time')).toBeTruthy();
      expect(compiled.querySelector('.stats-card--today')).toBeTruthy();
    });

    it('should display worked and target time', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const workedElement = compiled.querySelector('.stats-card__worked');
      const targetElement = compiled.querySelector('.stats-card__target');
      expect(workedElement?.textContent?.trim()).toBe('4:30');
      expect(targetElement?.textContent?.trim()).toBe('8:00');
    });

    it('should display progress bar', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const progressBar = compiled.querySelector('p-progressbar');
      expect(progressBar).toBeTruthy();
    });

    it('should display icon label', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const labelElement = compiled.querySelector('.stats-card__header span');
      expect(labelElement?.textContent?.trim()).toBe('Today');
    });

    it('should expose accessible progress label with worked and target', () => {
      expect(component.progressLabel()).toBe('Progress: 4:30 of 8:00 (56%)');
    });

    it('should render ARIA attributes for progressbar', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const progressBar = compiled.querySelector('p-progressbar');
      expect(progressBar?.getAttribute('aria-label')).toBe(
        'Progress: 4:30 of 8:00 (56%)',
      );
      expect(progressBar?.getAttribute('aria-valuetext')).toBe('56%');
    });

    it('should fallback progress label when worked and target are empty', () => {
      fixture.componentRef.setInput('worked', '');
      fixture.componentRef.setInput('target', '');
      fixture.componentRef.setInput('progress', 10);
      fixture.detectChanges();

      expect(component.progressLabel()).toBe('Progress: 10%');
    });
  });

  describe('Stats Ring Variant', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('variant', 'stats-ring');
      fixture.componentRef.setInput('statsModifier', 'today');
      fixture.componentRef.setInput('icon', 'pi-sun');
      fixture.componentRef.setInput('iconLabel', 'Today');
      fixture.componentRef.setInput('worked', '3:15');
      fixture.componentRef.setInput('target', '8:00');
      fixture.componentRef.setInput('remaining', '4:45');
      fixture.componentRef.setInput('progress', 41);
      fixture.detectChanges();
    });

    it('should render stats-ring card', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.open-card--stats-ring')).toBeTruthy();
      expect(compiled.querySelector('.stats-card__ring')).toBeTruthy();
    });

    it('should display the progress percentage in the ring label', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const label = compiled.querySelector('.stats-card__ring-label');
      expect(label?.textContent?.trim()).toBe('41%');
    });

    it('should expose progress semantics via role="progressbar"', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const bar = compiled.querySelector('[role="progressbar"]');
      expect(bar?.getAttribute('aria-valuenow')).toBe('41');
      expect(bar?.getAttribute('aria-valuemin')).toBe('0');
      expect(bar?.getAttribute('aria-valuemax')).toBe('100');
      expect(bar?.getAttribute('aria-label')).toBe(
        'Progress: 3:15 of 8:00 (41%)',
      );
    });

    it('should offset the ring stroke proportionally to progress', () => {
      // At 41% the drawn arc leaves 59% of the circumference as offset.
      const expected = component.ringCircumference * (1 - 41 / 100);
      expect(component.ringOffset()).toBeCloseTo(expected, 5);
    });

    it('should clamp out-of-range progress when computing the offset', () => {
      fixture.componentRef.setInput('progress', 150);
      fixture.detectChanges();
      expect(component.ringOffset()).toBeCloseTo(0, 5);

      fixture.componentRef.setInput('progress', -20);
      fixture.detectChanges();
      expect(component.ringOffset()).toBeCloseTo(
        component.ringCircumference,
        5,
      );
    });
  });

  describe('Stats Count Variant', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('variant', 'stats-count');
      fixture.componentRef.setInput('icon', 'pi-check-square');
      fixture.componentRef.setInput('iconLabel', 'Tasks today');
      fixture.componentRef.setInput('bigNumber', 12);
      fixture.detectChanges();
    });

    it('should render stats-count card', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.open-card--stats-count')).toBeTruthy();
      expect(compiled.querySelector('.stats-card--tasks')).toBeTruthy();
    });

    it('should display big number', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const numberElement = compiled.querySelector('.stats-card__big-number');
      expect(numberElement?.textContent?.trim()).toBe('12');
    });

    it('should display icon label', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const labelElement = compiled.querySelector('.stats-card__header span');
      expect(labelElement?.textContent?.trim()).toBe('Tasks today');
    });
  });

  describe('Task Variant', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('variant', 'task');
      fixture.componentRef.setInput('title', 'Add calendar view');
      fixture.componentRef.setInput(
        'subtitle',
        'Develop calendar component for tracking',
      );
      fixture.componentRef.setInput('status', 'In Progress');
      fixture.componentRef.setInput('statusSeverity', 'info');
      fixture.componentRef.setInput('tags', ['feature', 'ui']);
      fixture.detectChanges();
    });

    it('should render task card', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.open-card--task')).toBeTruthy();
    });

    it('should display task title', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const nameElement = compiled.querySelector('.task-card__name');
      expect(nameElement?.textContent?.trim()).toBe('Add calendar view');
    });

    it('should display task subtitle', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const descElement = compiled.querySelector('.task-card__description');
      expect(descElement?.textContent?.trim()).toBe(
        'Develop calendar component for tracking',
      );
    });

    it('should display status tag', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const statusTag = compiled.querySelector('p-tag');
      expect(statusTag).toBeTruthy();
    });

    it('should display task tags', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const chips = compiled.querySelectorAll('p-chip');
      expect(chips.length).toBe(2);
    });
  });
});
