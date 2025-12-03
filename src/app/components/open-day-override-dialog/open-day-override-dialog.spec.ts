import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { OpenDayOverrideDialogComponent } from './open-day-override-dialog';
import { TranslateModule } from '@ngx-translate/core';
import { DayOverride, DayType } from '../../../types/electron';

describe('OpenDayOverrideDialogComponent', () => {
  let component: OpenDayOverrideDialogComponent;
  let fixture: ComponentFixture<OpenDayOverrideDialogComponent>;

  const today = new Date();
  const mockDayTypes: DayType[] = [
    {
      id: 'dt-1',
      name: 'Holiday',
      color: '#FF0000',
      defaultMinutes: 480,
      createdAt: today,
    },
    {
      id: 'dt-2',
      name: 'Sick Leave',
      color: '#00FF00',
      defaultMinutes: 0,
      createdAt: today,
    },
  ];

  const mockDayOverride: DayOverride = {
    id: 'do-1',
    date: '2025-12-25',
    dayTypeId: 'dt-1',
    minutes: 240,
    note: 'Half day holiday',
    createdAt: today,
    updatedAt: today,
    dayType: mockDayTypes[0],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpenDayOverrideDialogComponent, TranslateModule.forRoot()],
      providers: [provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(OpenDayOverrideDialogComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('selectedDate', today);
    fixture.componentRef.setInput('dayTypes', mockDayTypes);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should initialize with default values for new override', () => {
    fixture.detectChanges();

    expect(component.dayTypeId()).toBeNull();
    expect(component.customMinutes()).toBeNull();
    expect(component.useCustomMinutes()).toBeFalse();
    expect(component.note()).toBe('');
  });

  it('should load day override when provided', async () => {
    fixture.componentRef.setInput('dayOverride', mockDayOverride);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.dayTypeId()).toBe('dt-1');
    expect(component.note()).toBe('Half day holiday');
    expect(component.useCustomMinutes()).toBeTrue();
    expect(component.customMinutes()).toBe(240);
  });

  it('should be in editing mode when dayOverride is provided', async () => {
    fixture.componentRef.setInput('dayOverride', mockDayOverride);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.isEditing()).toBeTrue();
  });

  it('should not be in editing mode for new override', () => {
    fixture.detectChanges();

    expect(component.isEditing()).toBeFalse();
  });

  it('should show add title for new override', () => {
    fixture.detectChanges();

    expect(component.dialogHeader()).toBe('dayOverride.addTitle');
  });

  it('should show edit title for existing override', async () => {
    fixture.componentRef.setInput('dayOverride', mockDayOverride);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.dialogHeader()).toBe('dayOverride.editTitle');
  });

  it('should be invalid when no day type is selected', () => {
    fixture.detectChanges();

    expect(component.isValid()).toBeFalse();
  });

  it('should be valid when day type is selected', () => {
    fixture.detectChanges();
    component.dayTypeId.set('dt-1');

    expect(component.isValid()).toBeTrue();
  });

  it('should return selected day type object', () => {
    fixture.detectChanges();
    component.dayTypeId.set('dt-1');

    expect(component.selectedDayType()).toEqual(mockDayTypes[0]);
  });

  it('should return null when no day type is selected', () => {
    fixture.detectChanges();

    expect(component.selectedDayType()).toBeNull();
  });

  it('should calculate effective minutes from day type', () => {
    fixture.detectChanges();
    component.dayTypeId.set('dt-1');

    expect(component.effectiveMinutes()).toBe(480);
  });

  it('should use custom minutes when enabled', () => {
    fixture.detectChanges();
    component.dayTypeId.set('dt-1');
    component.useCustomMinutes.set(true);
    component.customMinutes.set(240);

    expect(component.effectiveMinutes()).toBe(240);
  });

  it('should emit saved event with correct data', () => {
    fixture.detectChanges();
    spyOn(component.saved, 'emit');

    component.dayTypeId.set('dt-1');
    component.note.set('Test note');
    component.onSave();

    expect(component.saved.emit).toHaveBeenCalledWith({
      dates: [today],
      dayTypeId: 'dt-1',
      minutes: null,
      note: 'Test note',
    });
  });

  it('should emit saved with custom minutes when enabled', () => {
    fixture.detectChanges();
    spyOn(component.saved, 'emit');

    component.dayTypeId.set('dt-1');
    component.useCustomMinutes.set(true);
    component.customMinutes.set(240);
    component.onSave();

    expect(component.saved.emit).toHaveBeenCalledWith({
      dates: [today],
      dayTypeId: 'dt-1',
      minutes: 240,
      note: null,
    });
  });

  it('should not emit saved when invalid', () => {
    fixture.detectChanges();
    spyOn(component.saved, 'emit');

    component.onSave();

    expect(component.saved.emit).not.toHaveBeenCalled();
  });

  it('should emit cancelled event', () => {
    fixture.detectChanges();
    spyOn(component.cancelled, 'emit');

    component.onCancel();

    expect(component.cancelled.emit).toHaveBeenCalled();
  });

  it('should emit cancelled when dialog closes', () => {
    fixture.detectChanges();
    spyOn(component.cancelled, 'emit');

    component.onVisibleChange(false);

    expect(component.cancelled.emit).toHaveBeenCalled();
  });

  it('should emit deleted event', () => {
    fixture.detectChanges();
    spyOn(component.deleted, 'emit');

    component.onDelete();

    expect(component.deleted.emit).toHaveBeenCalled();
  });

  it('should emit manageDayTypes event', () => {
    fixture.detectChanges();
    spyOn(component.manageDayTypes, 'emit');

    component.onManageDayTypes();

    expect(component.manageDayTypes.emit).toHaveBeenCalled();
  });

  it('should format date correctly', () => {
    fixture.detectChanges();

    const formatted = component.formattedDate();
    expect(formatted).toBeTruthy();
    expect(typeof formatted).toBe('string');
  });

  it('should set custom minutes from day type default on checkbox change', () => {
    fixture.detectChanges();
    component.dayTypeId.set('dt-1');
    component.useCustomMinutes.set(true);

    component.onUseCustomMinutesChange();

    expect(component.customMinutes()).toBe(480);
  });

  it('should not override custom minutes if already set', () => {
    fixture.detectChanges();
    component.dayTypeId.set('dt-1');
    component.customMinutes.set(120);
    component.useCustomMinutes.set(true);

    component.onUseCustomMinutesChange();

    expect(component.customMinutes()).toBe(120);
  });

  it('should reset form when dialog opens with no override', async () => {
    fixture.componentRef.setInput('dayOverride', null);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.dayTypeId()).toBeNull();
    expect(component.note()).toBe('');
    expect(component.useCustomMinutes()).toBeFalse();
    expect(component.customMinutes()).toBeNull();
  });

  describe('range mode', () => {
    it('should toggle range mode', () => {
      fixture.detectChanges();
      component.useRangeMode.set(true);
      expect(component.useRangeMode()).toBeTrue();
    });

    it('should format date range correctly', () => {
      fixture.detectChanges();
      component.useRangeMode.set(true);
      const start = new Date(2025, 11, 1);
      const end = new Date(2025, 11, 5);
      component.dateRange.set([start, end]);

      const formatted = component.formattedDate();
      expect(formatted).toContain('-');
    });

    it('should return all dates in range', () => {
      fixture.detectChanges();
      component.useRangeMode.set(true);
      const start = new Date(2025, 11, 1);
      const end = new Date(2025, 11, 3);
      component.dateRange.set([start, end]);

      const dates = component.allSelectedDates();
      expect(dates.length).toBe(3);
    });

    it('should return single date when range is incomplete', () => {
      fixture.detectChanges();
      component.useRangeMode.set(true);
      component.dateRange.set([today]);

      const dates = component.allSelectedDates();
      expect(dates.length).toBe(1);
    });

    it('should return single date when range has null end', () => {
      fixture.detectChanges();
      component.useRangeMode.set(true);
      component.dateRange.set([today, null as unknown as Date]);

      const dates = component.allSelectedDates();
      expect(dates.length).toBe(1);
    });

    it('should return single date when not in range mode', () => {
      fixture.detectChanges();
      component.useRangeMode.set(false);

      const dates = component.allSelectedDates();
      expect(dates.length).toBe(1);
      expect(dates[0]).toEqual(today);
    });

    it('should format single date when range is incomplete', () => {
      fixture.detectChanges();
      component.useRangeMode.set(true);
      component.dateRange.set([today]);

      const formatted = component.formattedDate();
      expect(formatted).toBeTruthy();
      expect(formatted).not.toContain(' - ');
    });
  });

  describe('day override with no custom minutes', () => {
    it('should not use custom minutes when override minutes is null', async () => {
      const overrideNoMinutes: DayOverride = {
        id: 'do-2',
        date: '2025-12-25',
        dayTypeId: 'dt-1',
        minutes: null,
        note: 'No custom minutes',
        createdAt: today,
        updatedAt: today,
      };
      fixture.componentRef.setInput('dayOverride', overrideNoMinutes);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.useCustomMinutes()).toBeFalse();
      expect(component.customMinutes()).toBeNull();
    });
  });

  describe('effectiveMinutes edge cases', () => {
    it('should return null when no day type selected', () => {
      fixture.detectChanges();
      expect(component.effectiveMinutes()).toBeNull();
    });

    it('should return day type default when custom minutes disabled', () => {
      fixture.detectChanges();
      component.dayTypeId.set('dt-1');
      component.useCustomMinutes.set(false);

      expect(component.effectiveMinutes()).toBe(480);
    });

    it('should return custom minutes when enabled and set', () => {
      fixture.detectChanges();
      component.dayTypeId.set('dt-1');
      component.useCustomMinutes.set(true);
      component.customMinutes.set(120);

      expect(component.effectiveMinutes()).toBe(120);
    });
  });

  describe('selectedDayType edge cases', () => {
    it('should return null when dayTypeId does not match any type', () => {
      fixture.detectChanges();
      component.dayTypeId.set('non-existent-id');

      expect(component.selectedDayType()).toBeNull();
    });
  });

  describe('onUseCustomMinutesChange edge cases', () => {
    it('should not set custom minutes when no day type selected', () => {
      fixture.detectChanges();
      component.dayTypeId.set(null);
      component.useCustomMinutes.set(true);
      component.customMinutes.set(null);

      component.onUseCustomMinutesChange();

      expect(component.customMinutes()).toBeNull();
    });

    it('should not modify custom minutes when checkbox is unchecked', () => {
      fixture.detectChanges();
      component.dayTypeId.set('dt-1');
      component.customMinutes.set(120);
      component.useCustomMinutes.set(false);

      component.onUseCustomMinutesChange();

      expect(component.customMinutes()).toBe(120);
    });
  });
});
