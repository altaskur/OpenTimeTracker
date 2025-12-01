import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';
import { OpenProjects } from './open-projects';
import { DatabaseService } from '../../services';
import { provideTranslateTestingModule } from '../../testing/test-utils';
import { Project } from '../../../types/electron';

describe('OpenProjects', () => {
  let component: OpenProjects;
  let fixture: ComponentFixture<OpenProjects>;
  let mockDatabaseService: jasmine.SpyObj<DatabaseService>;
  let mockMessageService: jasmine.SpyObj<MessageService>;

  const createMockProject = (
    id: string,
    name: string,
    description: string | null = null,
  ): Project => ({
    id,
    name,
    description,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  });

  beforeEach(async () => {
    mockDatabaseService = jasmine.createSpyObj('DatabaseService', [
      'getProjects',
      'createProject',
      'updateProject',
      'deleteProject',
    ]);

    await TestBed.configureTestingModule({
      imports: [OpenProjects],
      providers: [
        { provide: DatabaseService, useValue: mockDatabaseService },
        MessageService,
        ...provideTranslateTestingModule(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OpenProjects);
    component = fixture.componentInstance;

    const messageService = fixture.debugElement.injector.get(MessageService);
    spyOn(messageService, 'add');
    mockMessageService =
      messageService as unknown as jasmine.SpyObj<MessageService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load projects on init', async () => {
    const mockProjects = [createMockProject('1', 'Project 1', 'Desc 1')];
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
    mockDatabaseService.getProjects.and.returnValue(
      Promise.reject(new Error('Error')),
    );

    await expectAsync(component.loadProjects()).toBeRejectedWithError('Error');
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
    const project = createMockProject('1', 'Test Project', 'Test Description');

    component.openEditDialog(project);

    expect(component.projectForm).toEqual({
      id: '1',
      name: 'Test Project',
      description: 'Test Description',
    });
    expect(component.dialogVisible()).toBe(true);
  });

  it('should open edit dialog with empty description if not provided', () => {
    const project = createMockProject('1', 'Test Project', null);

    component.openEditDialog(project as Project);

    expect(component.projectForm.description).toBe('');
  });

  it('should create new project when id is empty', async () => {
    const mockProject = createMockProject('new-id', 'New Project', 'New Desc');
    mockDatabaseService.createProject.and.returnValue(
      Promise.resolve(mockProject),
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
    const mockProject = createMockProject('1', 'Updated', 'Updated Desc');
    mockDatabaseService.updateProject.and.returnValue(
      Promise.resolve(mockProject),
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

  it('should show error toast when saving project fails', async () => {
    mockDatabaseService.createProject.and.returnValue(
      Promise.reject(new Error('Save error')),
    );

    component.projectForm = { id: '', name: 'New', description: '' };
    await component.saveProject();

    expect(mockMessageService.add).toHaveBeenCalledWith(
      jasmine.objectContaining({ severity: 'error' }),
    );
  });

  it('should open delete confirmation dialog', () => {
    const project = createMockProject('1', 'Test Project', 'Test Description');

    component.confirmDeleteProject(project);

    expect(component.deleteDialogVisible()).toBe(true);
    expect(component.projectToDelete()).toEqual(project);
  });

  it('should delete project on confirmation', async () => {
    const project = createMockProject('1', 'Test Project', 'Test Description');
    mockDatabaseService.deleteProject.and.returnValue(
      Promise.resolve({ success: true }),
    );
    mockDatabaseService.getProjects.and.returnValue(Promise.resolve([]));

    component.projectToDelete.set(project);
    component.deleteDialogVisible.set(true);

    await component.onDeleteConfirmed();

    expect(mockDatabaseService.deleteProject).toHaveBeenCalledWith('1');
    expect(mockDatabaseService.getProjects).toHaveBeenCalled();
    expect(component.deleteDialogVisible()).toBe(false);
    expect(component.projectToDelete()).toBeNull();
  });

  it('should close dialog and reset state on cancel', () => {
    const project = createMockProject('1', 'Test Project', 'Test Description');

    component.projectToDelete.set(project);
    component.deleteDialogVisible.set(true);

    component.onDeleteCancelled();

    expect(component.deleteDialogVisible()).toBe(false);
    expect(component.projectToDelete()).toBeNull();
    expect(mockDatabaseService.deleteProject).not.toHaveBeenCalled();
  });

  it('should not delete if no project selected', async () => {
    component.projectToDelete.set(null);
    mockDatabaseService.getProjects.and.returnValue(Promise.resolve([]));

    await component.onDeleteConfirmed();

    expect(mockDatabaseService.deleteProject).not.toHaveBeenCalled();
    expect(component.deleteDialogVisible()).toBe(false);
  });
});
