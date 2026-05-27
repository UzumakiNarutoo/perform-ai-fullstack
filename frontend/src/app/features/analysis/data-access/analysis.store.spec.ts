import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { AnalysisStore } from './analysis.store';
import { AnalysisApiService } from './analysis-api.service';

describe('AnalysisStore', () => {
  let store: AnalysisStore;
  let apiSpy: jasmine.SpyObj<AnalysisApiService>;

  beforeEach(() => {
    apiSpy = jasmine.createSpyObj('AnalysisApiService', ['create', 'getById']);

    TestBed.configureTestingModule({
      providers: [
        AnalysisStore,
        { provide: AnalysisApiService, useValue: apiSpy },
      ],
    });

    store = TestBed.inject(AnalysisStore);
  });

  it('starts idle', () => {
    expect(store.state().status).toBe('idle');
    expect(store.state().data).toBeNull();
    expect(store.state().error).toBeNull();
  });

  it('transitions idle → submitting → polling → success', fakeAsync(() => {
    const pending = { id: 'abc-123', status: 'PENDING' as const };
    const completed = {
      id: 'abc-123',
      status: 'COMPLETED' as const,
      foot_contact: 0.32,
      foot_off: 1.08,
      turning_point: 1.22,
    };

    apiSpy.create.and.returnValue(of(pending));
    apiSpy.getById.and.returnValue(of(completed));

    store.submit('Demo Athlete');

    // create() resolves synchronously — should be polling now
    expect(store.state().status).toBe('polling');

    // timer(0, 1000) fires first emission on tick(0)
    tick(0);

    expect(store.state().status).toBe('success');
    expect(store.state().data?.foot_contact).toBe(0.32);
    expect(store.state().data?.foot_off).toBe(1.08);
    expect(store.state().data?.turning_point).toBe(1.22);
  }));

  it('transitions to error when create fails', fakeAsync(() => {
    apiSpy.create.and.returnValue(throwError(() => new Error('network error')));

    store.submit('Demo Athlete');

    expect(store.state().status).toBe('error');
    expect(store.state().error).toBeTruthy();
  }));

  it('reset returns to idle', fakeAsync(() => {
    apiSpy.create.and.returnValue(throwError(() => new Error('network error')));
    store.submit('Demo Athlete');

    store.reset();

    expect(store.state().status).toBe('idle');
    expect(store.state().error).toBeNull();
  }));
});
