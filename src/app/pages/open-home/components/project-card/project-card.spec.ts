import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ProjectCard } from './project-card';
import { Project } from '../../../../../types/electron';

describe('ProjectCard', () => {
  let component: ProjectCard;
  let fixture: ComponentFixture<ProjectCard>;

  const mockProject: Project = {
    id: '1',
    name: 'Test Project',
    description: 'A test project for unit testing',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-15'),
    isClosed: false,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectCard],
      providers: [provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectCard);
    component = fixture.componentInstance;
  });

  describe('component creation', () => {
    it('should create', () => {
      fixture.componentRef.setInput('project', mockProject);
      fixture.detectChanges();
      expect(component).toBeTruthy();
    });
  });

  describe('project input', () => {
    it('should accept project input', () => {
      fixture.componentRef.setInput('project', mockProject);
      fixture.detectChanges();

      expect(component.project()).toEqual(mockProject);
    });

    it('should reflect project name changes', () => {
      fixture.componentRef.setInput('project', mockProject);
      fixture.detectChanges();

      expect(component.project().name).toBe('Test Project');

      const updatedProject = { ...mockProject, name: 'Updated Project' };
      fixture.componentRef.setInput('project', updatedProject);
      fixture.detectChanges();

      expect(component.project().name).toBe('Updated Project');
    });

    it('should handle different project data', () => {
      const anotherProject: Project = {
        id: '2',
        name: 'Another Project',
        description: 'Different project',
        createdAt: new Date('2026-02-01'),
        updatedAt: new Date('2026-02-05'),
        isClosed: false,
      };

      fixture.componentRef.setInput('project', anotherProject);
      fixture.detectChanges();

      expect(component.project()).toEqual(anotherProject);
      expect(component.project().id).toBe('2');
      expect(component.project().name).toBe('Another Project');
    });
  });

  describe('rendering', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('project', mockProject);
      fixture.detectChanges();
    });

    it('should display project name', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const nameElement = compiled.querySelector('.project-card__name');

      expect(nameElement).toBeTruthy();
      expect(nameElement?.textContent?.trim()).toBe('Test Project');
    });

    it('should have project-card article element', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const articleElement = compiled.querySelector('article.project-card');

      expect(articleElement).toBeTruthy();
    });

    it('should contain p-card component', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const cardElement = compiled.querySelector('p-card');

      expect(cardElement).toBeTruthy();
    });

    it('should have project-card__header div', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const headerElement = compiled.querySelector('.project-card__header');

      expect(headerElement).toBeTruthy();
    });

    it('should display folder icon', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const iconElement = compiled.querySelector('.pi.pi-folder');

      expect(iconElement).toBeTruthy();
    });

    it('should update project name in DOM when input changes', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      let nameElement = compiled.querySelector('.project-card__name');

      expect(nameElement?.textContent?.trim()).toBe('Test Project');

      const updatedProject = { ...mockProject, name: 'New Name' };
      fixture.componentRef.setInput('project', updatedProject);
      fixture.detectChanges();

      nameElement = compiled.querySelector('.project-card__name');
      expect(nameElement?.textContent?.trim()).toBe('New Name');
    });

    it('should render with minimal project data', () => {
      const minimalProject: Project = {
        id: '999',
        name: 'Minimal',
        description: '',
        createdAt: new Date(),
        updatedAt: new Date(),
        isClosed: false,
      };

      fixture.componentRef.setInput('project', minimalProject);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const nameElement = compiled.querySelector('.project-card__name');

      expect(nameElement?.textContent?.trim()).toBe('Minimal');
    });

    it('should handle project with long name', () => {
      const longNameProject: Project = {
        ...mockProject,
        name: 'Project with a very long name that might need special handling',
      };

      fixture.componentRef.setInput('project', longNameProject);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const nameElement = compiled.querySelector('.project-card__name');

      expect(nameElement?.textContent?.trim()).toBe(
        'Project with a very long name that might need special handling',
      );
    });

    it('should handle project with special characters in name', () => {
      const specialNameProject: Project = {
        ...mockProject,
        name: 'Project #1 @ 2026 & Co.',
      };

      fixture.componentRef.setInput('project', specialNameProject);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const nameElement = compiled.querySelector('.project-card__name');

      expect(nameElement?.textContent?.trim()).toBe('Project #1 @ 2026 & Co.');
    });
  });

  describe('structure', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('project', mockProject);
      fixture.detectChanges();
    });

    it('should have header as direct child of p-card', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const cardElement = compiled.querySelector('p-card');
      const headerElement = cardElement?.querySelector('.project-card__header');

      expect(headerElement).toBeTruthy();
    });

    it('should have icon and name inside header', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const headerElement = compiled.querySelector('.project-card__header');
      const icon = headerElement?.querySelector('.pi.pi-folder');
      const name = headerElement?.querySelector('.project-card__name');

      expect(icon).toBeTruthy();
      expect(name).toBeTruthy();
    });

    it('should have h3 element for project name', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const nameElement = compiled.querySelector('.project-card__name');

      expect(nameElement?.tagName.toLowerCase()).toBe('h3');
    });
  });
});
