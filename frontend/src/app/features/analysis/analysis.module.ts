import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { AthleteFormComponent } from './ui/athlete-form/athlete-form.component';
import { ResultsPanelComponent } from './ui/results-panel/results-panel.component';

@NgModule({
  declarations: [AthleteFormComponent, ResultsPanelComponent],
  imports: [CommonModule, ReactiveFormsModule, IonicModule],
  exports: [AthleteFormComponent, ResultsPanelComponent],
})
export class AnalysisModule {}
