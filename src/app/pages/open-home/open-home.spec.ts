import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OpenHome } from './open-home';
import { Router } from '@angular/router';

describe('OpenHome', () => {
  let component: OpenHome;
  let fixture: ComponentFixture<OpenHome>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [OpenHome],
      providers: [{ provide: Router, useValue: mockRouter }],
    }).compileComponents();

    fixture = TestBed.createComponent(OpenHome);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to remaining time', () => {
    component.goToRemainingTime();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/remaining-time']);
  });

  it('should navigate to projects', () => {
    component.goToProjects();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/projects']);
  });

  it('should toggle dark mode by adding class', () => {
    const htmlElement = document.querySelector('html');
    const initialHasClass = htmlElement?.classList.contains('my-app-dark');

    component.toggleDarkMode();

    const afterToggle = htmlElement?.classList.contains('my-app-dark');
    expect(afterToggle).toBe(!initialHasClass);
  });

  it('should toggle dark mode on and off', () => {
    const htmlElement = document.querySelector('html');

    htmlElement?.classList.remove('my-app-dark');

    component.toggleDarkMode();
    expect(htmlElement?.classList.contains('my-app-dark')).toBe(true);

    component.toggleDarkMode();
    expect(htmlElement?.classList.contains('my-app-dark')).toBe(false);
  });
});
