import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskTableComponent } from './task-table';
import { TranslateModule } from '@ngx-translate/core';
import { TaskWithTags } from '../../../../interfaces';

describe('TaskTableComponent', () => {
  let component: TaskTableComponent;
  let fixture: ComponentFixture<TaskTableComponent>;

  const mockTasks: TaskWithTags[] = [
    {
      id: 'task1',
      projectId: '1',
      name: 'Task 1',
      description: 'Task description',
      estimatedHours: 5,
      statusId: 's1',
      status: { id: 's1', name: 'Pendiente' },
      project: {
        id: '1',
        name: 'Project 1',
        description: null,
        isClosed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: [{ tag: { id: 't1', name: 'Bug' } }],
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskTableComponent, TranslateModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskTableComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('tasks', mockTasks);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display tasks', () => {
    expect(component.tasks()).toEqual(mockTasks);
  });

  it('should emit editTask when edit button clicked', () => {
    const editSpy = spyOn(component.editTask, 'emit');
    component.onEdit(mockTasks[0]);
    expect(editSpy).toHaveBeenCalledWith(mockTasks[0]);
  });

  it('should emit deleteTask when delete button clicked', () => {
    const deleteSpy = spyOn(component.deleteTask, 'emit');
    component.onDelete(mockTasks[0]);
    expect(deleteSpy).toHaveBeenCalledWith(mockTasks[0]);
  });

  it('should return correct severity for status', () => {
    expect(component.getStatusSeverity('Completada')).toBe('success');
    expect(component.getStatusSeverity('En progreso')).toBe('info');
    expect(component.getStatusSeverity('Pendiente')).toBe('warn');
    expect(component.getStatusSeverity('Bloqueada')).toBe('danger');
    expect(component.getStatusSeverity('Unknown')).toBe('secondary');
  });
});
