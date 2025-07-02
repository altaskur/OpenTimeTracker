import { Component } from '@angular/core';
import { PanelModule } from 'primeng/panel';
import { TimeAllocationTable } from './time-allocation-table/time-allocation-table';
import { ProjectForm } from './project-form/project-form';

@Component({
  selector: 'app-dashboard',
  imports: [PanelModule, TimeAllocationTable, ProjectForm],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  // Datos de ejemplo para la tabla de asignación de tiempo
  todayTimeAllocation: any[] = [
    {
      project: 'Project A',
      timeAllocated: '4h 30m',
      percentage: 56,
    },
    {
      project: 'Project B',
      timeAllocated: '2h 15m',
      percentage: 28,
    },
    {
      project: 'Project C',
      timeAllocated: '1h 15m',
      percentage: 16,
    },
  ];

  // Método para manejar el envío del formulario
  onFormSubmit(formData: any) {
    console.log('Form submitted:', formData);

    // Aquí puedes agregar la lógica para guardar los datos
    // Por ejemplo, enviar a un servicio
  }
}
