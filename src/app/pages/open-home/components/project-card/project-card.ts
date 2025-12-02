import { Component, input } from '@angular/core';
import { CardModule } from 'primeng/card';
import { Project } from '../../../../../types/electron';

/**
 * Project card component for displaying an open project
 */
@Component({
  selector: 'app-project-card',
  standalone: true,
  imports: [CardModule],
  templateUrl: './project-card.html',
  styleUrl: './project-card.scss',
})
export class ProjectCard {
  /**
   * Project to display
   */
  project = input.required<Project>();
}
