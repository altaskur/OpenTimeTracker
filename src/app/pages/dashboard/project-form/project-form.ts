import { Component, inject, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-project-form',
  imports: [SelectModule, FormsModule, ReactiveFormsModule],
  templateUrl: './project-form.html',
  styleUrl: './project-form.scss',
})
export class ProjectForm {
  readonly #fb = inject(FormBuilder);

  @Output() formSubmit = new EventEmitter<any>();

  // FormGroup para el formulario reactivo
  projectForm = this.#fb.group({
    selectedProject: [null],
  });

  projectList: any[] = [
    { name: 'Project A', id: 1 },
    { name: 'Project B', id: 2 },
    { name: 'Project C', id: 3 },
  ];

  // Método para manejar el envío del formulario
  onSubmitForm() {
    const formData = this.projectForm.value;
    this.formSubmit.emit(formData);
  }
}
