import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-athlete-form',
  templateUrl: './athlete-form.component.html',
  standalone: false,
})
export class AthleteFormComponent implements OnInit {
  @Input() loading = false;
  @Output() submitted = new EventEmitter<string>();

  form!: FormGroup;
  private readonly fb = inject(FormBuilder);

  ngOnInit(): void {
    this.form = this.fb.group({
      athlete: ['', [Validators.required, Validators.maxLength(120)]],
    });
  }

  onSubmit(): void {
    if (this.form.valid && !this.loading) {
      this.submitted.emit(this.form.value['athlete'] as string);
    }
  }
}
