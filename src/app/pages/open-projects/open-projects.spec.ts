import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OpenProjects } from './open-projects';
import { DatabaseService } from '../../services/database.service';

describe('OpenProjects', () => {
  let component: OpenProjects;
  let fixture: ComponentFixture<OpenProjects>;
  let mockDatabaseService: jasmine.SpyObj<DatabaseService>;

  beforeEach(async () => {
    mockDatabaseService = jasmine.createSpyObj('DatabaseService', [
      'getProjects',
      'createProject',
      'updateProject',
      'deleteProject',
    ]);

    await TestBed.configureTestingModule({
      imports: [OpenProjects],
      providers: [{ provide: DatabaseService, useValue: mockDatabaseService }],
    }).compileComponents();

    fixture = TestBed.createComponent(OpenProjects);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load projects on init', async () => {
    const mockProjects = [
      {
        id: '1',
        name: 'Project 1',
        description: 'Desc 1',
        created_at: '2025-01-01',
      },
    ];
    mockDatabaseService.getProjects.and.returnValue(
      Promise.resolve(mockProjects),
    );

    await component.ngOnInit();
    await fixture.whenStable();

    expect(mockDatabaseService.getProjects).toHaveBeenCalled();
    expect(component.projects()).toEqual(mockProjects);
  });

  it('should set loading state during loadProjects', async () => {
    mockDatabaseService.getProjects.and.returnValue(Promise.resolve([]));

    const loadPromise = component.loadProjects();
    expect(component.loading()).toBe(true);

    await loadPromise;
    expect(component.loading()).toBe(false);
  });

  it('should handle error when loading projects', async () => {
    spyOn(console, 'error');
    mockDatabaseService.getProjects.and.returnValue(Promise.reject('Error'));

    await component.loadProjects();

    expect(console.error).toHaveBeenCalledWith(
      'Error loading projects:',
      'Error',
    );
    expect(component.loading()).toBe(false);
  });

  it('should open new dialog with empty form', () => {
    component.openNewDialog();

    expect(component.projectForm).toEqual({
      id: '',
      name: '',
      description: '',
    });
    expect(component.dialogVisible()).toBe(true);
  });

  it('should open edit dialog with project data', () => {
    const project = {
      id: '1',
      name: 'Test Project',
      description: 'Test Description',
      created_at: '2025-01-01',
    };

    component.openEditDialog(project);

    expect(component.projectForm).toEqual({
      id: '1',
      name: 'Test Project',
      description: 'Test Description',
    });
    expect(component.dialogVisible()).toBe(true);
  });

  it('should open edit dialog with empty description if not provided', () => {
    const project = {
      id: '1',
      name: 'Test Project',
      description: undefined,
      created_at: '2025-01-01',
    };

    component.openEditDialog(project);

    expect(component.projectForm.description).toBe('');
  });

  it('should create new project when id is empty', async () => {
    mockDatabaseService.createProject.and.returnValue(
      Promise.resolve({ changes: 1 }),
    );
    mockDatabaseService.getProjects.and.returnValue(Promise.resolve([]));

    component.projectForm = {
      id: '',
      name: 'New Project',
      description: 'New Desc',
    };
    await component.saveProject();

    expect(mockDatabaseService.createProject).toHaveBeenCalledWith(
      'New Project',
      'New Desc',
    );
    expect(component.dialogVisible()).toBe(false);
    expect(mockDatabaseService.getProjects).toHaveBeenCalled();
  });

  it('should update existing project when id is provided', async () => {
    mockDatabaseService.updateProject.and.returnValue(
      Promise.resolve({ changes: 1 }),
    );
    mockDatabaseService.getProjects.and.returnValue(Promise.resolve([]));

    component.projectForm = {
      id: '1',
      name: 'Updated',
      description: 'Updated Desc',
    };
    await component.saveProject();

    expect(mockDatabaseService.updateProject).toHaveBeenCalledWith(
      '1',
      'Updated',
      'Updated Desc',
    );
    expect(component.dialogVisible()).toBe(false);
    expect(mockDatabaseService.getProjects).toHaveBeenCalled();
  });

  it('should handle error when saving project', async () => {
    spyOn(console, 'error');
    mockDatabaseService.createProject.and.returnValue(
      Promise.reject('Save error'),
    );

    component.projectForm = { id: '', name: 'New', description: '' };
    await component.saveProject();

    expect(console.error).toHaveBeenCalledWith(
      'Error saving project:',
      'Save error',
    );
  });

  it('should delete project after confirmation', async () => {
    spyOn(window, 'confirm').and.returnValue(true);
    mockDatabaseService.deleteProject.and.returnValue(
      Promise.resolve({ changes: 1 }),
    );
    mockDatabaseService.getProjects.and.returnValue(Promise.resolve([]));

    await component.deleteProject('1');

    expect(window.confirm).toHaveBeenCalledWith(
      '¿Está seguro de eliminar este proyecto?',
    );
    expect(mockDatabaseService.deleteProject).toHaveBeenCalledWith('1');
    expect(mockDatabaseService.getProjects).toHaveBeenCalled();
  });

  it('should not delete project if user cancels confirmation', async () => {
    spyOn(window, 'confirm').and.returnValue(false);

    await component.deleteProject('1');

    expect(mockDatabaseService.deleteProject).not.toHaveBeenCalled();
  });

  it('should handle error when deleting project', async () => {
    spyOn(window, 'confirm').and.returnValue(true);
    spyOn(console, 'error');
    mockDatabaseService.deleteProject.and.returnValue(
      Promise.reject('Delete error'),
    );

    await component.deleteProject('1');

    expect(console.error).toHaveBeenCalledWith(
      'Error deleting project:',
      'Delete error',
    );
  });
});
