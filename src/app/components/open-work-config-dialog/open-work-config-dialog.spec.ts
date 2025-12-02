import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { OpenWorkConfigDialogComponent } from './open-work-config-dialog';
import { TranslateModule } from '@ngx-translate/core';
import { MonthConfig } from '../../../types/electron';

describe('OpenWorkConfigDialogComponent', () => {
  let component: OpenWorkConfigDialogComponent;
  let fixture: ComponentFixture<OpenWorkConfigDialogComponent>;

  const today = new Date();
  const mockConfig: MonthConfig = {
    id: '1',
    year: 2025,
    month: 12,
    weeklyMinutes: 2400,
    workDays: '1,2,3,4,5',
    daySchedule: '{"1":480,"2":480,"3":480,"4":480,"5":480}',
    createdAt: today,
    updatedAt: today,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpenWorkConfigDialogComponent, TranslateModule.forRoot()],
      providers: [provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(OpenWorkConfigDialogComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('visible', true);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    fixture.detectChanges();

    expect(component.weeklyHours()).toBe(40);
    expect(
      component
        .weekDays()
        .filter((d: { selected: boolean }) => d.selected)
        .map((d: { id: number }) => d.id),
    ).toEqual([1, 2, 3, 4, 5]);
  });

  it('should load config when provided', async () => {
    fixture.componentRef.setInput('config', mockConfig);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.weeklyHours()).toBe(40);
  });

  it('should calculate weekly minutes correctly', () => {
    fixture.detectChanges();
    component.weeklyHours.set(40);

    expect(component.totalWeeklyMinutes()).toBe(2400);
  });

  it('should generate work days string correctly', () => {
    fixture.detectChanges();

    expect(component.workDaysString()).toBe('1,2,3,4,5');
  });

  it('should toggle day selection', () => {
    fixture.detectChanges();

    component.toggleDay(6);

    expect(
      component.weekDays().find((d: { id: number }) => d.id === 6)?.selected,
    ).toBeTrue();
  });

  it('should identify last work day correctly', () => {
    fixture.detectChanges();

    const friday = component.weekDays().find((d: { id: number }) => d.id === 5);
    expect(friday?.isLastWorkDay).toBeTrue();
  });

  it('should update day hours', () => {
    fixture.detectChanges();

    component.updateDayHours(1, 9);

    const monday = component.weekDays().find((d: { id: number }) => d.id === 1);
    expect(monday?.hours).toBe(9);
  });

  it('should emit saved event with correct data', () => {
    fixture.detectChanges();
    spyOn(component.saved, 'emit');

    component.onSave();

    expect(component.saved.emit).toHaveBeenCalledWith({
      weeklyMinutes: 2400,
      workDays: '1,2,3,4,5',
      daySchedule: jasmine.any(String),
    });
  });

  it('should emit cancelled event', () => {
    fixture.detectChanges();
    spyOn(component.cancelled, 'emit');

    component.onCancel();

    expect(component.cancelled.emit).toHaveBeenCalled();
  });

  it('should format minutes to time string', () => {
    fixture.detectChanges();

    expect(component.formatMinutesToTime(510)).toBe('8h 30m');
    expect(component.formatMinutesToTime(480)).toBe('8h 0m');
    expect(component.formatMinutesToTime(0)).toBe('0h 0m');
  });
});
