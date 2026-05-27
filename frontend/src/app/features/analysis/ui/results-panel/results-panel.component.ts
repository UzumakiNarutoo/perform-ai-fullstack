import { Component, Input } from '@angular/core';
import { AnalysisState } from '../../data-access/analysis.store';

@Component({
  selector: 'app-results-panel',
  templateUrl: './results-panel.component.html',
})
export class ResultsPanelComponent {
  @Input() state!: AnalysisState;
}
