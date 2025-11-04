import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Home } from './home';
import { Router } from '@angular/router';

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [{ provide: Router, useValue: mockRouter }],
    }).compileComponents();

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to dashboard', () => {
    component.goToDashboard();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
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

    // Remove class if it exists to start clean
    htmlElement?.classList.remove('my-app-dark');

    // First toggle should add
    component.toggleDarkMode();
    expect(htmlElement?.classList.contains('my-app-dark')).toBe(true);

    // Second toggle should remove
    component.toggleDarkMode();
    expect(htmlElement?.classList.contains('my-app-dark')).toBe(false);
  });
});
