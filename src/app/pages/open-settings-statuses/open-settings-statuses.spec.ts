import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { OpenSettingsStatusesComponent } from './open-settings-statuses';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { DatabaseService } from '../../services/database/database.service';
import { TaskStatus } from '../../../types/electron';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

describe('OpenSettingsStatusesComponent', () => {
  let component: OpenSettingsStatusesComponent;
  let fixture: ComponentFixture<OpenSettingsStatusesComponent>;
  let mockDbService: jasmine.SpyObj<DatabaseService>;
  let mockMessageService: jasmine.SpyObj<MessageService>;
  let translateService: TranslateService;

  const mockStatuses: TaskStatus[] = [
    { id: 's1', name: 'status.pending', color: '#f59e0b', isDefault: true },
    { id: 's2', name: 'status.completed', color: '#6b7280', isDefault: true },
    { id: 's3', name: 'Custom', color: '#123456', isDefault: false },
  ];

  beforeEach(async () => {
    mockDbService = jasmine.createSpyObj('DatabaseService', [
      'getTaskStatuses',
      'createTaskStatus',
      'updateTaskStatus',
      'deleteTaskStatus',
    ]);

    mockDbService.getTaskStatuses.and.returnValue(
      Promise.resolve(mockStatuses),
    );
    mockDbService.createTaskStatus.and.returnValue(
      Promise.resolve({
        id: 's4',
        name: 'New',
        color: '#000000',
        isDefault: false,
      }),
    );
    mockDbService.updateTaskStatus.and.returnValue(
      Promise.resolve({
        id: 's1',
        name: 'status.pending',
        color: '#ffffff',
        isDefault: true,
      }),
    );
    mockDbService.deleteTaskStatus.and.returnValue(Promise.resolve(null));

    await TestBed.configureTestingModule({
      imports: [OpenSettingsStatusesComponent, TranslateModule.forRoot()],
      providers: [
        provideNoopAnimations(),
        { provide: DatabaseService, useValue: mockDbService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OpenSettingsStatusesComponent);
    component = fixture.componentInstance;
    translateService = TestBed.inject(TranslateService);
    mockMessageService = fixture.debugElement.injector.get(
      MessageService,
    ) as jasmine.SpyObj<MessageService>;
    spyOn(mockMessageService, 'add');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load statuses on init', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      expect(mockDbService.getTaskStatuses).toHaveBeenCalled();
      expect(component.statuses()).toEqual(mockStatuses);
    }));
  });

  describe('loadStatuses', () => {
    it('should set loading state while fetching', fakeAsync(() => {
      expect(component.loading()).toBeFalse();
      component.loadStatuses();
      expect(component.loading()).toBeTrue();
      tick();
      expect(component.loading()).toBeFalse();
    }));
  });

  describe('getStatusDisplayName', () => {
    it('should translate status keys starting with status.', () => {
      spyOn(translateService, 'instant').and.returnValue('Pendiente');
      const result = component.getStatusDisplayName(mockStatuses[0]);
      expect(translateService.instant).toHaveBeenCalledWith('status.pending');
      expect(result).toBe('Pendiente');
    });

    it('should return original name for non-translation keys', () => {
      const result = component.getStatusDisplayName(mockStatuses[2]);
      expect(result).toBe('Custom');
    });
  });

  describe('canAdd', () => {
    it('should return false when newStatusName is empty', () => {
      component.newStatusName.set('');
      expect(component.canAdd()).toBeFalse();
    });

    it('should return true when newStatusName has content', () => {
      component.newStatusName.set('New Status');
      expect(component.canAdd()).toBeTrue();
    });
  });

  describe('addStatus', () => {
    it('should not add status if name is empty', fakeAsync(() => {
      component.newStatusName.set('');
      component.addStatus();
      tick();
      expect(mockDbService.createTaskStatus).not.toHaveBeenCalled();
    }));

    it('should create status and reload', fakeAsync(() => {
      component.newStatusName.set('New Status');
      component.newStatusColor.set('#ff0000');
      component.addStatus();
      tick();
      expect(mockDbService.createTaskStatus).toHaveBeenCalledWith(
        'New Status',
        '#ff0000',
      );
      expect(component.newStatusName()).toBe('');
      expect(component.newStatusColor()).toBe('#6b7280');
      expect(mockMessageService.add).toHaveBeenCalled();
    }));

    it('should show error message on failure', fakeAsync(() => {
      mockDbService.createTaskStatus.and.returnValue(
        Promise.reject(new Error('fail')),
      );
      component.newStatusName.set('New Status');
      component.addStatus();
      tick();
      expect(mockMessageService.add).toHaveBeenCalledWith(
        jasmine.objectContaining({ severity: 'error' }),
      );
    }));
  });

  describe('startEdit', () => {
    it('should set editing state for default status with translated name', () => {
      spyOn(translateService, 'instant').and.returnValue('Pendiente');
      component.startEdit(mockStatuses[0]);
      expect(component.editingId()).toBe('s1');
      expect(component.editingName()).toBe('Pendiente');
      expect(component.editingColor()).toBe('#f59e0b');
    });

    it('should set editing state for custom status with original name', () => {
      component.startEdit(mockStatuses[2]);
      expect(component.editingId()).toBe('s3');
      expect(component.editingName()).toBe('Custom');
      expect(component.editingColor()).toBe('#123456');
    });
  });

  describe('cancelEdit', () => {
    it('should clear editing state', () => {
      component.editingId.set('s1');
      component.editingName.set('Test');
      component.editingColor.set('#000000');
      component.cancelEdit();
      expect(component.editingId()).toBeNull();
      expect(component.editingName()).toBe('');
      expect(component.editingColor()).toBe('');
    });
  });

  describe('saveEdit', () => {
    it('should not save if name is empty', fakeAsync(() => {
      component.editingName.set('');
      component.saveEdit(mockStatuses[0]);
      tick();
      expect(mockDbService.updateTaskStatus).not.toHaveBeenCalled();
    }));

    it('should update default status keeping original name', fakeAsync(() => {
      component.editingName.set('New Name');
      component.editingColor.set('#ffffff');
      component.saveEdit(mockStatuses[0]);
      tick();
      expect(mockDbService.updateTaskStatus).toHaveBeenCalledWith(
        's1',
        'status.pending',
        '#ffffff',
      );
    }));

    it('should update custom status with new name', fakeAsync(() => {
      component.editingName.set('Updated Custom');
      component.editingColor.set('#abcdef');
      component.saveEdit(mockStatuses[2]);
      tick();
      expect(mockDbService.updateTaskStatus).toHaveBeenCalledWith(
        's3',
        'Updated Custom',
        '#abcdef',
      );
    }));

    it('should show error message on failure', fakeAsync(() => {
      mockDbService.updateTaskStatus.and.returnValue(
        Promise.reject(new Error('fail')),
      );
      component.editingName.set('Updated');
      component.saveEdit(mockStatuses[2]);
      tick();
      expect(mockMessageService.add).toHaveBeenCalledWith(
        jasmine.objectContaining({ severity: 'error' }),
      );
    }));
  });

  describe('deleteStatus', () => {
    it('should not delete default status', fakeAsync(() => {
      spyOn(translateService, 'instant').and.returnValue('Cannot delete');
      component.deleteStatus(mockStatuses[0]);
      tick();
      expect(mockDbService.deleteTaskStatus).not.toHaveBeenCalled();
      expect(mockMessageService.add).toHaveBeenCalledWith(
        jasmine.objectContaining({ severity: 'warn' }),
      );
    }));

    it('should delete custom status and reload', fakeAsync(() => {
      component.deleteStatus(mockStatuses[2]);
      tick();
      expect(mockDbService.deleteTaskStatus).toHaveBeenCalledWith('s3');
      expect(mockMessageService.add).toHaveBeenCalled();
    }));

    it('should show error message on failure', fakeAsync(() => {
      mockDbService.deleteTaskStatus.and.returnValue(
        Promise.reject(new Error('fail')),
      );
      component.deleteStatus(mockStatuses[2]);
      tick();
      expect(mockMessageService.add).toHaveBeenCalledWith(
        jasmine.objectContaining({ severity: 'error' }),
      );
    }));
  });
});
