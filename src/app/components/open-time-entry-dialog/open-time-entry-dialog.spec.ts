import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { OpenTimeEntryDialogComponent } from './open-time-entry-dialog';
import { TranslateModule } from '@ngx-translate/core';
import { TimeEntry, Task } from '../../../types/electron';

describe('OpenTimeEntryDialogComponent', () => {
  let component: OpenTimeEntryDialogComponent;
  let fixture: ComponentFixture<OpenTimeEntryDialogComponent>;

  const today = new Date();
  const mockTimeEntry: TimeEntry = {
    id: '1',
    taskId: 'task-1',
    date: today.toISOString().split('T')[0],
    minutes: 510,
    notes: 'Test entry',
    createdAt: today,
    updatedAt: today,
  };

  const mockTasks: Task[] = [
    {
      id: 'task-1',
      name: 'Task 1',
      projectId: 'p1',
      statusId: 's1',
      description: null,
      estimatedHours: 8,
      createdAt: today,
      updatedAt: today,
      status: { id: 's1', name: 'In Progress' },
      tags: [],
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpenTimeEntryDialogComponent, TranslateModule.forRoot()],
      providers: [provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(OpenTimeEntryDialogComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('tasks', mockTasks);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should initialize with default values for new entry', () => {
    fixture.detectChanges();

    expect(component.hours()).toBe(0);
    expect(component.minutes()).toBe(0);
    expect(component.taskId()).toBeNull();
    expect(component.notes()).toBe('');
  });

  it('should load time entry when provided', async () => {
    fixture.componentRef.setInput('timeEntry', mockTimeEntry);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.hours()).toBe(8);
    expect(component.minutes()).toBe(30);
    expect(component.taskId()).toBe('task-1');
    expect(component.notes()).toBe('Test entry');
  });

  it('should use selected date for new entries', async () => {
    const selectedDate = new Date(2025, 11, 25);
    fixture.componentRef.setInput('selectedDate', selectedDate);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.date().toDateString()).toBe(selectedDate.toDateString());
  });

  it('should calculate total minutes correctly', () => {
    fixture.detectChanges();
    component.hours.set(2);
    component.minutes.set(30);

    expect(component.totalMinutes()).toBe(150);
  });

  it('should be invalid when total minutes is zero', () => {
    fixture.detectChanges();
    component.hours.set(0);
    component.minutes.set(0);

    expect(component.isValid()).toBeFalse();
  });

  it('should be valid when total minutes is greater than zero', () => {
    fixture.detectChanges();
    component.hours.set(1);
    component.minutes.set(0);

    expect(component.isValid()).toBeTrue();
  });

  it('should show add title for new entries', () => {
    fixture.detectChanges();

    expect(component.dialogHeader()).toBe('timeEntry.addTitle');
  });

  it('should show edit title for existing entries', async () => {
    fixture.componentRef.setInput('timeEntry', mockTimeEntry);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.dialogHeader()).toBe('timeEntry.editTitle');
  });

  it('should emit saved event with correct data', () => {
    fixture.detectChanges();
    spyOn(component.saved, 'emit');

    component.hours.set(2);
    component.minutes.set(30);
    component.taskId.set('task-1');
    component.notes.set('Test notes');
    component.onSave();

    expect(component.saved.emit).toHaveBeenCalledWith({
      taskId: 'task-1',
      date: component.date(),
      minutes: 150,
      notes: 'Test notes',
    });
  });

  it('should not emit saved when invalid', () => {
    fixture.detectChanges();
    spyOn(component.saved, 'emit');

    component.hours.set(0);
    component.minutes.set(0);
    component.onSave();

    expect(component.saved.emit).not.toHaveBeenCalled();
  });

  it('should emit cancelled event', () => {
    fixture.detectChanges();
    spyOn(component.cancelled, 'emit');

    component.onCancel();

    expect(component.cancelled.emit).toHaveBeenCalled();
  });
});
