import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { OpenConfirmDeleteComponent } from './open-confirm-delete';
import { TranslateModule } from '@ngx-translate/core';

describe('OpenConfirmDeleteComponent', () => {
  let component: OpenConfirmDeleteComponent;
  let fixture: ComponentFixture<OpenConfirmDeleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpenConfirmDeleteComponent, TranslateModule.forRoot()],
      providers: [provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(OpenConfirmDeleteComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('message', 'Are you sure?');
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should emit confirmed event on confirm', () => {
    fixture.detectChanges();
    spyOn(component.confirmed, 'emit');

    component.onConfirm();

    expect(component.confirmed.emit).toHaveBeenCalled();
  });

  it('should emit cancelled event on cancel', () => {
    fixture.detectChanges();
    spyOn(component.cancelled, 'emit');

    component.onCancel();

    expect(component.cancelled.emit).toHaveBeenCalled();
  });

  it('should display the message input', () => {
    fixture.detectChanges();

    expect(component.message()).toBe('Are you sure?');
  });

  it('should have visible input', () => {
    fixture.detectChanges();

    expect(component.visible()).toBeTrue();
  });
});
