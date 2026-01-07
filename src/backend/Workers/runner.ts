/**
 * Catalyst Queue Worker Runner
 * 
 * Standalone process for processing queued jobs.
 * Run with: npm run worker
 */

import { Job, SerializedJob } from '@/backend/Jobs/Job';

interface WorkerOptions {
  queue: string;
  concurrency: number;
  sleep: number;
}

class Worker {
  private options: WorkerOptions;
  private running: boolean = false;
  private processing: number = 0;

  constructor(options: Partial<WorkerOptions> = {}) {
    this.options = {
      queue: options.queue || 'default',
      concurrency: options.concurrency || 1,
      sleep: options.sleep || 3000, // 3 seconds between checks
    };
  }

  /**
   * Start the worker
   */
  async start(): Promise<void> {
    console.log(`[Worker] Starting worker for queue: ${this.options.queue}`);
    console.log(`[Worker] Concurrency: ${this.options.concurrency}`);
    
    this.running = true;

    while (this.running) {
      await this.processNextJob();
      
      // Wait before checking for more jobs
      if (this.processing === 0) {
        await this.sleep(this.options.sleep);
      }
    }

    console.log('[Worker] Worker stopped');
  }

  /**
   * Stop the worker
   */
  stop(): void {
    console.log('[Worker] Stopping worker...');
    this.running = false;
  }

  /**
   * Process the next job in the queue
   */
  private async processNextJob(): Promise<void> {
    if (this.processing >= this.options.concurrency) {
      return;
    }

    // TODO: Fetch job from Redis/BullMQ
    // const job = await queue.getJob(this.options.queue);
    // if (!job) return;

    // Simulate job processing for now
    console.log(`[Worker] Waiting for jobs on queue: ${this.options.queue}`);
  }

  /**
   * Execute a job
   */
  private async executeJob(serialized: SerializedJob): Promise<void> {
    this.processing++;
    console.log(`[Worker] Processing job: ${serialized.id} (${serialized.class})`);

    try {
      // TODO: Deserialize and execute the job
      // const JobClass = this.resolveJobClass(serialized.class);
      // const job = new JobClass(serialized.payload);
      // job.attempts = serialized.attempts + 1;
      // await job.handle();

      console.log(`[Worker] Job completed: ${serialized.id}`);
    } catch (error) {
      console.error(`[Worker] Job failed: ${serialized.id}`, error);

      // Check if should retry
      if (serialized.attempts < 3) {
        // TODO: Re-queue with backoff
        console.log(`[Worker] Re-queuing job: ${serialized.id} (attempt ${serialized.attempts + 1})`);
      } else {
        // TODO: Move to failed jobs table
        console.log(`[Worker] Job permanently failed: ${serialized.id}`);
      }
    } finally {
      this.processing--;
    }
  }

  /**
   * Sleep for a duration
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ==================== MAIN ====================

const worker = new Worker({
  queue: process.env.QUEUE_NAME || 'default',
  concurrency: parseInt(process.env.QUEUE_CONCURRENCY || '1', 10),
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n[Worker] Received SIGINT. Gracefully shutting down...');
  worker.stop();
});

process.on('SIGTERM', () => {
  console.log('\n[Worker] Received SIGTERM. Gracefully shutting down...');
  worker.stop();
});

// Start the worker
worker.start().catch(console.error);

export { Worker };
export default Worker;
