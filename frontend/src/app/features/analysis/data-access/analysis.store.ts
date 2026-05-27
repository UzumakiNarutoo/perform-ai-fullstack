import { Injectable, signal, computed } from '@angular/core';
import { timer } from 'rxjs';
import { switchMap, takeWhile, take } from 'rxjs/operators';
import { AnalysisApiService, AnalysisResponse } from './analysis-api.service';

export type StoreStatus = 'idle' | 'submitting' | 'polling' | 'success' | 'error';

export interface AnalysisState {
  status: StoreStatus;
  data: AnalysisResponse | null;
  error: string | null;
}

@Injectable({ providedIn: 'root' })
export class AnalysisStore {
  private readonly _state = signal<AnalysisState>({
    status: 'idle',
    data: null,
    error: null,
  });

  readonly state = this._state.asReadonly();

  readonly isLoading = computed(() => {
    const s = this._state().status;
    return s === 'submitting' || s === 'polling';
  });

  constructor(private readonly api: AnalysisApiService) {}

  submit(athlete: string): void {
    this._state.set({ status: 'submitting', data: null, error: null });

    this.api.create({ athlete }).subscribe({
      next: (initial) => {
        this._state.set({ status: 'polling', data: initial, error: null });

        timer(0, 1000)
          .pipe(
            switchMap(() => this.api.getById(initial.id)),
            takeWhile(
              (r) => r.status !== 'COMPLETED' && r.status !== 'FAILED',
              true,
            ),
            take(30),
          )
          .subscribe({
            next: (r) => {
              this._state.set({ status: 'polling', data: r, error: null });
            },
            complete: () => {
              const last = this._state().data;
              if (last?.status === 'COMPLETED') {
                this._state.set({ status: 'success', data: last, error: null });
              } else {
                this._state.set({ status: 'error', data: null, error: 'Analysis failed.' });
              }
            },
            error: () => {
              this._state.set({ status: 'error', data: null, error: 'Polling failed. Please try again.' });
            },
          });
      },
      error: () => {
        this._state.set({ status: 'error', data: null, error: 'Failed to submit analysis. Please try again.' });
      },
    });
  }

  reset(): void {
    this._state.set({ status: 'idle', data: null, error: null });
  }
}
