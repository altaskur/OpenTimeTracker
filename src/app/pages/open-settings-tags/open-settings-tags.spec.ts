import { provideRouter } from '@angular/router';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { OpenSettingsTagsComponent } from './open-settings-tags';
import { TranslateModule } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { DatabaseService } from '../../services/database/database.service';
import { Tag } from '../../../types/electron';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

describe('OpenSettingsTagsComponent', () => {
  let component: OpenSettingsTagsComponent;
  let fixture: ComponentFixture<OpenSettingsTagsComponent>;
  let mockDbService: jasmine.SpyObj<DatabaseService>;
  let mockMessageService: jasmine.SpyObj<MessageService>;

  const mockTags: Tag[] = [
    { id: 't1', name: 'Bug' },
    { id: 't2', name: 'Feature' },
  ];

  beforeEach(async () => {
    mockDbService = jasmine.createSpyObj('DatabaseService', [
      'getTags',
      'createTag',
      'updateTag',
      'deleteTag',
    ]);

    mockDbService.getTags.and.returnValue(Promise.resolve(mockTags));
    mockDbService.createTag.and.returnValue(
      Promise.resolve({ id: 't3', name: 'New Tag' }),
    );
    mockDbService.updateTag.and.returnValue(
      Promise.resolve({ id: 't1', name: 'Updated Bug' }),
    );
    mockDbService.deleteTag.and.returnValue(Promise.resolve({ success: true }));

    await TestBed.configureTestingModule({
      imports: [OpenSettingsTagsComponent, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        { provide: DatabaseService, useValue: mockDbService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OpenSettingsTagsComponent);
    component = fixture.componentInstance;
    mockMessageService = fixture.debugElement.injector.get(
      MessageService,
    ) as jasmine.SpyObj<MessageService>;
    spyOn(mockMessageService, 'add');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load tags on init', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      expect(mockDbService.getTags).toHaveBeenCalled();
      expect(component.tags()).toEqual(mockTags);
    }));
  });

  describe('loadTags', () => {
    it('should set loading state while fetching', fakeAsync(() => {
      expect(component.loading()).toBeFalse();
      component.loadTags();
      expect(component.loading()).toBeTrue();
      tick();
      expect(component.loading()).toBeFalse();
    }));
  });

  describe('canAdd', () => {
    it('should return false when newTagName is empty', () => {
      component.newTagName.set('');
      expect(component.canAdd()).toBeFalse();
    });

    it('should return false when newTagName is only whitespace', () => {
      component.newTagName.set('   ');
      expect(component.canAdd()).toBeFalse();
    });

    it('should return true when newTagName has content', () => {
      component.newTagName.set('New Tag');
      expect(component.canAdd()).toBeTrue();
    });
  });

  describe('addTag', () => {
    it('should not add tag if name is empty', fakeAsync(() => {
      component.newTagName.set('');
      component.addTag();
      tick();
      expect(mockDbService.createTag).not.toHaveBeenCalled();
    }));

    it('should create tag and reload', fakeAsync(() => {
      component.newTagName.set('New Tag');
      component.addTag();
      tick();
      expect(mockDbService.createTag).toHaveBeenCalledWith('New Tag');
      expect(component.newTagName()).toBe('');
      expect(mockMessageService.add).toHaveBeenCalled();
    }));

    it('should show error message on failure', fakeAsync(() => {
      mockDbService.createTag.and.returnValue(
        Promise.reject(new Error('fail')),
      );
      component.newTagName.set('New Tag');
      component.addTag();
      tick();
      expect(mockMessageService.add).toHaveBeenCalledWith(
        jasmine.objectContaining({ severity: 'error' }),
      );
    }));
  });

  describe('startEdit', () => {
    it('should set editing state', () => {
      const tag = { id: 't1', name: 'Bug' };
      component.startEdit(tag);
      expect(component.editingId()).toBe('t1');
      expect(component.editingName()).toBe('Bug');
    });
  });

  describe('cancelEdit', () => {
    it('should clear editing state', () => {
      component.editingId.set('t1');
      component.editingName.set('Bug');
      component.cancelEdit();
      expect(component.editingId()).toBeNull();
      expect(component.editingName()).toBe('');
    });
  });

  describe('saveEdit', () => {
    it('should not save if name is empty', fakeAsync(() => {
      component.editingName.set('');
      component.saveEdit({ id: 't1', name: 'Bug' });
      tick();
      expect(mockDbService.updateTag).not.toHaveBeenCalled();
    }));

    it('should update tag and reload', fakeAsync(() => {
      component.editingName.set('Updated Bug');
      component.saveEdit({ id: 't1', name: 'Bug' });
      tick();
      expect(mockDbService.updateTag).toHaveBeenCalledWith('t1', 'Updated Bug');
      expect(component.editingId()).toBeNull();
      expect(mockMessageService.add).toHaveBeenCalled();
    }));

    it('should show error message on failure', fakeAsync(() => {
      mockDbService.updateTag.and.returnValue(
        Promise.reject(new Error('fail')),
      );
      component.editingName.set('Updated Bug');
      component.saveEdit({ id: 't1', name: 'Bug' });
      tick();
      expect(mockMessageService.add).toHaveBeenCalledWith(
        jasmine.objectContaining({ severity: 'error' }),
      );
    }));
  });

  describe('deleteTag', () => {
    it('should delete tag and reload', fakeAsync(() => {
      component.deleteTag({ id: 't1', name: 'Bug' });
      tick();
      expect(mockDbService.deleteTag).toHaveBeenCalledWith('t1');
      expect(mockMessageService.add).toHaveBeenCalled();
    }));

    it('should show error message on failure', fakeAsync(() => {
      mockDbService.deleteTag.and.returnValue(
        Promise.reject(new Error('fail')),
      );
      component.deleteTag({ id: 't1', name: 'Bug' });
      tick();
      expect(mockMessageService.add).toHaveBeenCalledWith(
        jasmine.objectContaining({ severity: 'error' }),
      );
    }));
  });
});
