import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { OpenDayTypesDialogComponent } from './open-day-types-dialog';
import { TranslateModule } from '@ngx-translate/core';
import { DayType } from '../../../types/electron';

describe('OpenDayTypesDialogComponent', () => {
  let component: OpenDayTypesDialogComponent;
  let fixture: ComponentFixture<OpenDayTypesDialogComponent>;

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

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpenDayTypesDialogComponent, TranslateModule.forRoot()],
      providers: [provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(OpenDayTypesDialogComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('dayTypes', mockDayTypes);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    fixture.detectChanges();

    expect(component.newName()).toBe('');
    expect(component.newColor()).toBe('#3B82F6');
    expect(component.newHours()).toBe(0);
    expect(component.editingId()).toBeNull();
  });

  it('should have access to day types input', () => {
    fixture.detectChanges();

    expect(component.dayTypes()).toEqual(mockDayTypes);
    expect(component.dayTypes().length).toBe(2);
  });

  it('should validate new form as invalid when name is empty', () => {
    fixture.detectChanges();
    component.newName.set('');

    expect(component.isNewFormValid()).toBeFalse();
  });

  it('should validate new form as invalid when name is whitespace', () => {
    fixture.detectChanges();
    component.newName.set('   ');

    expect(component.isNewFormValid()).toBeFalse();
  });

  it('should validate new form as valid when name is provided', () => {
    fixture.detectChanges();
    component.newName.set('Vacation');

    expect(component.isNewFormValid()).toBeTrue();
  });

  it('should emit created event with correct data', () => {
    fixture.detectChanges();
    spyOn(component.created, 'emit');

    component.newName.set('Vacation');
    component.newColor.set('#0000FF');
    component.newHours.set(8);
    component.onCreate();

    expect(component.created.emit).toHaveBeenCalledWith({
      name: 'Vacation',
      color: '#0000FF',
      defaultMinutes: 480,
    });
  });

  it('should trim name when creating', () => {
    fixture.detectChanges();
    spyOn(component.created, 'emit');

    component.newName.set('  Vacation  ');
    component.newColor.set('#0000FF');
    component.newHours.set(8);
    component.onCreate();

    expect(component.created.emit).toHaveBeenCalledWith({
      name: 'Vacation',
      color: '#0000FF',
      defaultMinutes: 480,
    });
  });

  it('should not emit created when name is empty', () => {
    fixture.detectChanges();
    spyOn(component.created, 'emit');

    component.newName.set('');
    component.onCreate();

    expect(component.created.emit).not.toHaveBeenCalled();
  });

  it('should reset form after creating', () => {
    fixture.detectChanges();
    spyOn(component.created, 'emit');

    component.newName.set('Vacation');
    component.newColor.set('#0000FF');
    component.newHours.set(8);
    component.onCreate();

    expect(component.newName()).toBe('');
    expect(component.newColor()).toBe('#3B82F6');
    expect(component.newHours()).toBe(0);
  });

  it('should start editing a day type', () => {
    fixture.detectChanges();

    component.startEdit(mockDayTypes[0]);

    expect(component.editingId()).toBe('dt-1');
    expect(component.editName()).toBe('Holiday');
    expect(component.editColor()).toBe('#FF0000');
    expect(component.editHours()).toBe(8);
  });

  it('should cancel editing', () => {
    fixture.detectChanges();
    component.startEdit(mockDayTypes[0]);

    component.cancelEdit();

    expect(component.editingId()).toBeNull();
  });

  it('should validate edit form as invalid when name is empty', () => {
    fixture.detectChanges();
    component.startEdit(mockDayTypes[0]);
    component.editName.set('');

    expect(component.isEditFormValid()).toBeFalse();
  });

  it('should validate edit form as valid when name is provided', () => {
    fixture.detectChanges();
    component.startEdit(mockDayTypes[0]);

    expect(component.isEditFormValid()).toBeTrue();
  });

  it('should emit updated event with correct data', () => {
    fixture.detectChanges();
    spyOn(component.updated, 'emit');

    component.startEdit(mockDayTypes[0]);
    component.editName.set('Vacation Day');
    component.editColor.set('#FFFF00');
    component.editHours.set(4);
    component.saveEdit();

    expect(component.updated.emit).toHaveBeenCalledWith({
      id: 'dt-1',
      name: 'Vacation Day',
      color: '#FFFF00',
      defaultMinutes: 240,
    });
  });

  it('should trim name when updating', () => {
    fixture.detectChanges();
    spyOn(component.updated, 'emit');

    component.startEdit(mockDayTypes[0]);
    component.editName.set('  Vacation Day  ');
    component.saveEdit();

    expect(component.updated.emit).toHaveBeenCalledWith(
      jasmine.objectContaining({ name: 'Vacation Day' }),
    );
  });

  it('should not emit updated when editing id is null', () => {
    fixture.detectChanges();
    spyOn(component.updated, 'emit');

    component.saveEdit();

    expect(component.updated.emit).not.toHaveBeenCalled();
  });

  it('should not emit updated when name is empty', () => {
    fixture.detectChanges();
    spyOn(component.updated, 'emit');

    component.startEdit(mockDayTypes[0]);
    component.editName.set('');
    component.saveEdit();

    expect(component.updated.emit).not.toHaveBeenCalled();
  });

  it('should clear editing id after saving', () => {
    fixture.detectChanges();
    spyOn(component.updated, 'emit');

    component.startEdit(mockDayTypes[0]);
    component.saveEdit();

    expect(component.editingId()).toBeNull();
  });

  it('should emit deleted event with id', () => {
    fixture.detectChanges();
    spyOn(component.deleted, 'emit');

    component.onDelete('dt-1');

    expect(component.deleted.emit).toHaveBeenCalledWith('dt-1');
  });

  it('should emit closed event', () => {
    fixture.detectChanges();
    spyOn(component.closed, 'emit');

    component.onClose();

    expect(component.closed.emit).toHaveBeenCalled();
  });

  it('should emit closed when dialog visibility changes to false', () => {
    fixture.detectChanges();
    spyOn(component.closed, 'emit');

    component.onVisibleChange(false);

    expect(component.closed.emit).toHaveBeenCalled();
  });

  it('should reset form when dialog opens', async () => {
    fixture.detectChanges();
    component.newName.set('Test');
    component.newColor.set('#000000');
    component.newHours.set(5);
    component.startEdit(mockDayTypes[0]);

    fixture.componentRef.setInput('visible', false);
    fixture.detectChanges();
    await fixture.whenStable();

    fixture.componentRef.setInput('visible', true);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.newName()).toBe('');
    expect(component.newColor()).toBe('#3B82F6');
    expect(component.newHours()).toBe(0);
    expect(component.editingId()).toBeNull();
  });

  it('should convert hours to minutes when creating', () => {
    fixture.detectChanges();
    spyOn(component.created, 'emit');

    component.newName.set('Half Day');
    component.newHours.set(4);
    component.onCreate();

    expect(component.created.emit).toHaveBeenCalledWith(
      jasmine.objectContaining({ defaultMinutes: 240 }),
    );
  });

  it('should convert minutes to hours when editing', () => {
    fixture.detectChanges();

    component.startEdit(mockDayTypes[0]);

    expect(component.editHours()).toBe(8);
  });
});
