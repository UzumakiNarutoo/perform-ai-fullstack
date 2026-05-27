import { AnalysisStatus } from '../../domain/analysis-status.enum.js';
import type { AnalysisRepositoryPort } from '../ports/analysis.repository.port.js';
import type { JobQueuePort } from '../ports/job-queue.port.js';
import { CreateAnalysisUseCase } from './create-analysis.use-case.js';

describe('CreateAnalysisUseCase', () => {
  let useCase: CreateAnalysisUseCase;
  let mockRepository: jest.Mocked<AnalysisRepositoryPort>;
  let mockQueue: jest.Mocked<JobQueuePort>;

  beforeEach(() => {
    mockRepository = {
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
    };
    mockQueue = {
      enqueue: jest.fn().mockResolvedValue(undefined),
    };
    useCase = new CreateAnalysisUseCase(mockRepository, mockQueue);
  });

  it('creates an analysis with PENDING status', async () => {
    const result = await useCase.execute('Test Athlete');

    expect(result.athlete).toBe('Test Athlete');
    expect(result.status).toBe(AnalysisStatus.PENDING);
    expect(typeof result.id).toBe('string');
    expect(result.id.length).toBeGreaterThan(0);
  });

  it('saves the analysis to the repository', async () => {
    await useCase.execute('Test Athlete');

    expect(mockRepository.save).toHaveBeenCalledTimes(1);
    expect(mockRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ status: AnalysisStatus.PENDING }),
    );
  });

  it('enqueues the analysis id for background processing', async () => {
    const result = await useCase.execute('Test Athlete');

    expect(mockQueue.enqueue).toHaveBeenCalledTimes(1);
    expect(mockQueue.enqueue).toHaveBeenCalledWith(result.id);
  });

  it('generates a unique id per execution', async () => {
    const a = await useCase.execute('Athlete A');
    const b = await useCase.execute('Athlete B');

    expect(a.id).not.toBe(b.id);
  });
});
