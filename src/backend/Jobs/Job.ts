/**
 * Catalyst Job Base Class
 * 
 * Abstract base class for queueable jobs with retry,
 * timeout, and backoff configuration.
 */

import { nanoid } from 'nanoid';

export interface JobPayload {
  [key: string]: unknown;
}

export interface JobOptions {
  queue?: string;
  delay?: number;
  tries?: number;
  timeout?: number;
  backoff?: number;
}

export interface SerializedJob {
  id: string;
  class: string;
  payload: unknown;
  attempts: number;
  queue: string;
  availableAt: number;
  createdAt: number;
}

export abstract class Job<T = JobPayload> {
  /** Unique job identifier */
  public id: string = nanoid();

  /** The number of times the job may be attempted */
  public tries: number = 3;

  /** The maximum number of seconds the job can run */
  public timeout: number = 60;

  /** The number of seconds to wait before retrying */
  public backoff: number = 0;

  /** The queue this job belongs to */
  public queue: string = 'default';

  /** Number of attempts made */
  public attempts: number = 0;

  /** The job payload */
  protected payload: T = {} as T;

  /** Whether the job has been released */
  private released: boolean = false;

  /** Whether the job has been deleted */
  private deleted: boolean = false;

  constructor(payload?: T) {
    if (payload) {
      this.payload = payload;
    }
  }

  /**
   * Execute the job
   */
  abstract handle(): Promise<void>;

  /**
   * Handle a job failure
   */
  async failed(error: Error): Promise<void> {
    console.error(`Job ${this.constructor.name} failed:`, error);
  }

  /**
   * Determine if the job should be retried
   */
  public shouldRetry(): boolean {
    return this.attempts < this.tries;
  }

  /**
   * Get the delay for the next retry
   */
  public getRetryDelay(): number {
    if (typeof this.backoff === 'number') {
      return this.backoff * 1000;
    }
    return 0;
  }

  /**
   * Release the job back into the queue
   */
  public release(delay: number = 0): void {
    this.released = true;
    // Job will be re-queued with delay
  }

  /**
   * Delete the job from the queue
   */
  public delete(): void {
    this.deleted = true;
  }

  /**
   * Check if the job was released
   */
  public isReleased(): boolean {
    return this.released;
  }

  /**
   * Check if the job was deleted
   */
  public isDeleted(): boolean {
    return this.deleted;
  }

  /**
   * Serialize the job for queue storage
   */
  public serialize(): SerializedJob {
    return {
      id: this.id,
      class: this.constructor.name,
      payload: this.payload,
      attempts: this.attempts,
      queue: this.queue,
      availableAt: Date.now(),
      createdAt: Date.now(),
    };
  }

  /**
   * Dispatch the job to the queue
   */
  static dispatch<T, J extends Job<T>>(this: new (payload?: T) => J, payload?: T): JobDispatcher<T, J> {
    const job = new this(payload);
    return new JobDispatcher(job);
  }
}

/**
 * Job dispatcher for fluent API
 */
class JobDispatcher<T, J extends Job<T>> {
  constructor(private job: J) {}

  /**
   * Set the delay before the job runs
   */
  delay(seconds: number): this {
    // Implementation would set availableAt
    return this;
  }

  /**
   * Set the queue for this job
   */
  onQueue(queue: string): this {
    this.job.queue = queue;
    return this;
  }

  /**
   * Actually dispatch the job
   */
  async dispatch(): Promise<string> {
    const serialized = this.job.serialize();
    
    // TODO: Push to Redis/BullMQ queue
    // await queue.add(serialized.queue, serialized);
    
    console.log(`[Queue] Dispatched job: ${serialized.class} to ${serialized.queue}`);
    return serialized.id;
  }
}

export default Job;
