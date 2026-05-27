import { Component, effect, inject } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { AnalysisStore } from './data-access/analysis.store';

@Component({
  selector: 'app-analysis',
  templateUrl: './analysis.page.html',
  standalone: false,
})
export class AnalysisPage {
  readonly store = inject(AnalysisStore);
  private readonly toastCtrl = inject(ToastController);

  private readonly errorEffect = effect(() => {
    const error = this.store.state().error;
    if (error) {
      void this.showErrorToast(error);
    }
  });

  onSubmitted(athlete: string): void {
    this.store.submit(athlete);
  }

  private async showErrorToast(message: string): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      color: 'danger',
    });
    await toast.present();
  }
}
