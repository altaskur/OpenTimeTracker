import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProjectTableComponent } from './project-table';
import { TranslateModule } from '@ngx-translate/core';
import { Project } from '../../../../../types/electron';

describe('ProjectTableComponent', () => {
  let component: ProjectTableComponent;
  let fixture: ComponentFixture<ProjectTableComponent>;

  const mockProjects: Project[] = [
    {
      id: '1',
      name: 'Project 1',
      description: 'Description 1',
      isClosed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectTableComponent, TranslateModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectTableComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('projects', mockProjects);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display projects', () => {
    expect(component.projects()).toEqual(mockProjects);
  });

  it('should emit editProject when edit button clicked', () => {
    const editSpy = spyOn(component.editProject, 'emit');
    component.onEdit(mockProjects[0]);
    expect(editSpy).toHaveBeenCalledWith(mockProjects[0]);
  });

  it('should emit deleteProject when delete button clicked', () => {
    const deleteSpy = spyOn(component.deleteProject, 'emit');
    component.onDelete(mockProjects[0]);
    expect(deleteSpy).toHaveBeenCalledWith(mockProjects[0]);
  });

  it('should emit closeProject when close button clicked', () => {
    const closeSpy = spyOn(component.closeProject, 'emit');
    component.onClose(mockProjects[0]);
    expect(closeSpy).toHaveBeenCalledWith(mockProjects[0]);
  });

  it('should emit reopenProject when reopen button clicked', () => {
    const reopenSpy = spyOn(component.reopenProject, 'emit');
    component.onReopen(mockProjects[0]);
    expect(reopenSpy).toHaveBeenCalledWith(mockProjects[0]);
  });
});
