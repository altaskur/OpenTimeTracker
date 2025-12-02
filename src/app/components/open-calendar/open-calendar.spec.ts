import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OpenCalendar } from './open-calendar';
import { TranslateModule } from '@ngx-translate/core';

describe('OpenCalendar', () => {
  let component: OpenCalendar;
  let fixture: ComponentFixture<OpenCalendar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpenCalendar, TranslateModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(OpenCalendar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initialization', () => {
    it('should initialize week days', () => {
      expect(component.weekDays().length).toBe(7);
    });

    it('should have current date set', () => {
      const currentDate = component.currentDate();
      expect(currentDate).toBeInstanceOf(Date);
    });

    it('should generate calendar days', () => {
      const days = component.calendarDays();
      expect(days.length).toBe(42);
    });
  });

  describe('navigation', () => {
    it('should navigate to previous month', () => {
      const initialDate = new Date(component.currentDate());
      component.previousMonth();
      const newDate = component.currentDate();

      expect(newDate.getMonth()).toBe(
        initialDate.getMonth() === 0 ? 11 : initialDate.getMonth() - 1,
      );
    });

    it('should navigate to next month', () => {
      const initialDate = new Date(component.currentDate());
      component.nextMonth();
      const newDate = component.currentDate();

      expect(newDate.getMonth()).toBe((initialDate.getMonth() + 1) % 12);
    });

    it('should go to today', () => {
      component.nextMonth();
      component.nextMonth();
      component.goToToday();

      const currentDate = component.currentDate();
      const today = new Date();

      expect(currentDate.getMonth()).toBe(today.getMonth());
      expect(currentDate.getFullYear()).toBe(today.getFullYear());
    });
  });

  describe('monthYearLabel', () => {
    it('should return formatted month and year', () => {
      const label = component.monthYearLabel();
      expect(label).toBeTruthy();
      expect(typeof label).toBe('string');
    });
  });

  describe('calendarDays', () => {
    it('should mark today correctly', () => {
      const days = component.calendarDays();
      const todayDay = days.find((d) => d.isToday);

      expect(todayDay).toBeTruthy();
      expect(todayDay?.dayNumber).toBe(new Date().getDate());
    });

    it('should mark other month days', () => {
      const days = component.calendarDays();
      const otherMonthDays = days.filter((d) => !d.isCurrentMonth);

      expect(otherMonthDays.length).toBeGreaterThan(0);
    });
  });

  describe('event handlers', () => {
    it('should emit dayClicked on day click', () => {
      spyOn(component.dayClicked, 'emit');
      const day = component.calendarDays()[15];

      component.onDayClick(day);

      expect(component.dayClicked.emit).toHaveBeenCalledWith(day.date);
    });
  });

  describe('getStatusSeverity', () => {
    it('should return success for Completada', () => {
      expect(component.getStatusSeverity('Completada')).toBe('success');
      expect(component.getStatusSeverity('Completed')).toBe('success');
    });

    it('should return info for En progreso', () => {
      expect(component.getStatusSeverity('En progreso')).toBe('info');
      expect(component.getStatusSeverity('In Progress')).toBe('info');
    });

    it('should return warn for Pendiente', () => {
      expect(component.getStatusSeverity('Pendiente')).toBe('warn');
      expect(component.getStatusSeverity('Pending')).toBe('warn');
    });

    it('should return danger for Bloqueada', () => {
      expect(component.getStatusSeverity('Bloqueada')).toBe('danger');
      expect(component.getStatusSeverity('Blocked')).toBe('danger');
    });

    it('should return secondary for unknown status', () => {
      expect(component.getStatusSeverity('Unknown')).toBe('secondary');
      expect(component.getStatusSeverity(undefined)).toBe('secondary');
    });
  });

  describe('getStatusColor', () => {
    it('should return correct color class for each status', () => {
      expect(component.getStatusColor('Completada')).toBe('status-completed');
      expect(component.getStatusColor('En progreso')).toBe('status-progress');
      expect(component.getStatusColor('Pendiente')).toBe('status-pending');
      expect(component.getStatusColor('Bloqueada')).toBe('status-blocked');
      expect(component.getStatusColor('Unknown')).toBe('status-default');
    });
  });
});
