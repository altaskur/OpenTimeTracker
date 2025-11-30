import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OpenRemainingTime } from './open-remaining-time';
import { DatabaseService } from '../../services/database.service';

describe('OpenRemainingTime', () => {
  let component: OpenRemainingTime;
  let fixture: ComponentFixture<OpenRemainingTime>;
  let mockDatabaseService: jasmine.SpyObj<DatabaseService>;

  beforeEach(async () => {
    mockDatabaseService = jasmine.createSpyObj('DatabaseService', [
      'getTimeEntries',
    ]);

    await TestBed.configureTestingModule({
      imports: [OpenRemainingTime],
      providers: [{ provide: DatabaseService, useValue: mockDatabaseService }],
    }).compileComponents();

    fixture = TestBed.createComponent(OpenRemainingTime);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load time entries on init', async () => {
    const mockEntries = [
      {
        id: '1',
        date: '2025-01-01',
        hours: 8,
        task_id: 't1',
        notes: 'Work',
        created_at: '2025-01-01T08:00:00Z',
      },
      {
        id: '2',
        date: '2025-01-02',
        hours: 6,
        task_id: 't2',
        notes: 'Meeting',
        created_at: '2025-01-02T08:00:00Z',
      },
    ];
    mockDatabaseService.getTimeEntries.and.returnValue(
      Promise.resolve(mockEntries),
    );

    await component.ngOnInit();
    await fixture.whenStable();

    expect(mockDatabaseService.getTimeEntries).toHaveBeenCalled();
    expect(component.timeEntries()).toEqual(mockEntries);
    expect(component.totalHours()).toBe(14);
  });

  it('should calculate total hours correctly', async () => {
    const mockEntries = [
      {
        id: '1',
        date: '2025-01-01',
        hours: 5.5,
        task_id: 't1',
        notes: '',
        created_at: '2025-01-01T08:00:00Z',
      },
      {
        id: '2',
        date: '2025-01-02',
        hours: 3.25,
        task_id: 't2',
        notes: '',
        created_at: '2025-01-02T08:00:00Z',
      },
      {
        id: '3',
        date: '2025-01-03',
        hours: 7,
        task_id: 't3',
        notes: '',
        created_at: '2025-01-03T08:00:00Z',
      },
    ];
    mockDatabaseService.getTimeEntries.and.returnValue(
      Promise.resolve(mockEntries),
    );

    await component.loadTimeEntries();

    expect(component.totalHours()).toBe(15.75);
  });

  it('should set loading state during loadTimeEntries', async () => {
    mockDatabaseService.getTimeEntries.and.returnValue(Promise.resolve([]));

    const loadPromise = component.loadTimeEntries();
    expect(component.loading()).toBe(true);

    await loadPromise;
    expect(component.loading()).toBe(false);
  });

  it('should handle empty time entries', async () => {
    mockDatabaseService.getTimeEntries.and.returnValue(Promise.resolve([]));

    await component.loadTimeEntries();

    expect(component.timeEntries()).toEqual([]);
    expect(component.totalHours()).toBe(0);
  });

  it('should handle error when loading time entries', async () => {
    spyOn(console, 'error');
    mockDatabaseService.getTimeEntries.and.returnValue(
      Promise.reject('Load error'),
    );

    await component.loadTimeEntries();

    expect(console.error).toHaveBeenCalledWith(
      'Error loading time entries:',
      'Load error',
    );
    expect(component.loading()).toBe(false);
  });
});
