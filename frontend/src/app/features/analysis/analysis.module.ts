import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { AnalysisPage } from './analysis.page';
import { AnalysisRoutingModule } from './analysis-routing.module';
import { AthleteFormComponent } from './ui/athlete-form/athlete-form.component';
import { ResultsPanelComponent } from './ui/results-panel/results-panel.component';

@NgModule({
  declarations: [AnalysisPage, AthleteFormComponent, ResultsPanelComponent],
  imports: [CommonModule, ReactiveFormsModule, IonicModule, AnalysisRoutingModule],
})
export class AnalysisModule {}
