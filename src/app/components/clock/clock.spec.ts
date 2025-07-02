import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Clock } from './clock';

describe('Clock', () => {
  let component: Clock;
  let fixture: ComponentFixture<Clock>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Clock]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Clock);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
