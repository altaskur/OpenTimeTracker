import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { OpenSettingsDayTypesComponent } from './open-settings-day-types';
import { TranslateModule } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { DatabaseService } from '../../services/database/database.service';
import { DayType } from '../../../types/electron';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

describe('OpenSettingsDayTypesComponent', () => {
  let component: OpenSettingsDayTypesComponent;
  let fixture: ComponentFixture<OpenSettingsDayTypesComponent>;
  let mockDbService: jasmine.SpyObj<DatabaseService>;
  let mockMessageService: jasmine.SpyObj<MessageService>;

  const mockDayTypes: DayType[] = [
    {
      id: 'd1',
      name: 'Festivo',
      color: '#ef4444',
      defaultMinutes: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'd2',
      name: 'Vacaciones',
      color: '#22c55e',
      defaultMinutes: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(async () => {
    mockDbService = jasmine.createSpyObj('DatabaseService', [
      'getDayTypes',
      'createDayType',
      'updateDayType',
      'deleteDayType',
    ]);

    mockDbService.getDayTypes.and.returnValue(Promise.resolve(mockDayTypes));
    mockDbService.createDayType.and.returnValue(
      Promise.resolve({
        id: 'd3',
        name: 'New',
        color: '#000000',
        defaultMinutes: 240,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    );
    mockDbService.updateDayType.and.returnValue(
      Promise.resolve({
        id: 'd1',
        name: 'Updated',
        color: '#ffffff',
        defaultMinutes: 120,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    );
    mockDbService.deleteDayType.and.returnValue(
      Promise.resolve({ success: true }),
    );

    await TestBed.configureTestingModule({
      imports: [OpenSettingsDayTypesComponent, TranslateModule.forRoot()],
      providers: [
        provideNoopAnimations(),
        { provide: DatabaseService, useValue: mockDbService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OpenSettingsDayTypesComponent);
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
    it('should load day types on init', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      expect(mockDbService.getDayTypes).toHaveBeenCalled();
      expect(component.dayTypes()).toEqual(mockDayTypes);
    }));
  });

  describe('loadDayTypes', () => {
    it('should set loading state while fetching', fakeAsync(() => {
      expect(component.loading()).toBeFalse();
      component.loadDayTypes();
      expect(component.loading()).toBeTrue();
      tick();
      expect(component.loading()).toBeFalse();
    }));
  });

  describe('onDayTypeCreated', () => {
    it('should create day type and reload', fakeAsync(() => {
      component.onDayTypeCreated({
        name: 'New Type',
        color: '#ff0000',
        defaultMinutes: 480,
      });
      tick();
      expect(mockDbService.createDayType).toHaveBeenCalledWith(
        'New Type',
        '#ff0000',
        480,
      );
      expect(mockDbService.getDayTypes).toHaveBeenCalled();
      expect(mockMessageService.add).toHaveBeenCalledWith(
        jasmine.objectContaining({ severity: 'success' }),
      );
    }));

    it('should show error message on failure', fakeAsync(() => {
      mockDbService.createDayType.and.returnValue(
        Promise.reject(new Error('fail')),
      );
      component.onDayTypeCreated({
        name: 'New Type',
        color: '#ff0000',
        defaultMinutes: 480,
      });
      tick();
      expect(mockMessageService.add).toHaveBeenCalledWith(
        jasmine.objectContaining({ severity: 'error' }),
      );
    }));
  });

  describe('onDayTypeUpdated', () => {
    it('should update day type and reload', fakeAsync(() => {
      component.onDayTypeUpdated({
        id: 'd1',
        name: 'Updated Festivo',
        color: '#00ff00',
        defaultMinutes: 240,
      });
      tick();
      expect(mockDbService.updateDayType).toHaveBeenCalledWith('d1', {
        name: 'Updated Festivo',
        color: '#00ff00',
        defaultMinutes: 240,
      });
      expect(mockDbService.getDayTypes).toHaveBeenCalled();
      expect(mockMessageService.add).toHaveBeenCalledWith(
        jasmine.objectContaining({ severity: 'success' }),
      );
    }));

    it('should show error message on failure', fakeAsync(() => {
      mockDbService.updateDayType.and.returnValue(
        Promise.reject(new Error('fail')),
      );
      component.onDayTypeUpdated({
        id: 'd1',
        name: 'Updated',
        color: '#00ff00',
        defaultMinutes: 240,
      });
      tick();
      expect(mockMessageService.add).toHaveBeenCalledWith(
        jasmine.objectContaining({ severity: 'error' }),
      );
    }));
  });

  describe('onDayTypeDeleted', () => {
    it('should delete day type and reload', fakeAsync(() => {
      component.onDayTypeDeleted('d1');
      tick();
      expect(mockDbService.deleteDayType).toHaveBeenCalledWith('d1');
      expect(mockDbService.getDayTypes).toHaveBeenCalled();
      expect(mockMessageService.add).toHaveBeenCalledWith(
        jasmine.objectContaining({ severity: 'success' }),
      );
    }));

    it('should show error message on failure', fakeAsync(() => {
      mockDbService.deleteDayType.and.returnValue(
        Promise.reject(new Error('fail')),
      );
      component.onDayTypeDeleted('d1');
      tick();
      expect(mockMessageService.add).toHaveBeenCalledWith(
        jasmine.objectContaining({ severity: 'error' }),
      );
    }));
  });

  describe('onDialogClosed', () => {
    it('should set showDialog to true', () => {
      component.showDialog.set(false);
      component.onDialogClosed();
      expect(component.showDialog()).toBeTrue();
    });
  });
});
