export const JOB_QUEUE = Symbol('JOB_QUEUE');

export interface JobQueuePort {
  enqueue(analysisId: string): Promise<void>;
}
