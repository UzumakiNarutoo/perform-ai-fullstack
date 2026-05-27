import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AthleteFormComponent } from './athlete-form.component';

describe('AthleteFormComponent', () => {
  let component: AthleteFormComponent;
  let fixture: ComponentFixture<AthleteFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AthleteFormComponent],
      imports: [ReactiveFormsModule, IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(AthleteFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('form is invalid when athlete is empty', () => {
    component.form.get('athlete')?.setValue('');
    expect(component.form.invalid).toBeTrue();
  });

  it('form is valid when athlete has a value', () => {
    component.form.get('athlete')?.setValue('Demo Athlete');
    expect(component.form.valid).toBeTrue();
  });

  it('emits athlete name on valid submit', () => {
    const emitted: string[] = [];
    component.submitted.subscribe((v: string) => emitted.push(v));

    component.form.get('athlete')?.setValue('Demo Athlete');
    component.onSubmit();

    expect(emitted).toEqual(['Demo Athlete']);
  });

  it('does not emit when loading is true', () => {
    const emitted: string[] = [];
    component.submitted.subscribe((v: string) => emitted.push(v));

    component.loading = true;
    component.form.get('athlete')?.setValue('Demo Athlete');
    component.onSubmit();

    expect(emitted).toHaveSize(0);
  });
});
