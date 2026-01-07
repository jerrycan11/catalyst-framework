/**
 * Catalyst Schedule Runner
 * 
 * Standalone process for running scheduled tasks.
 * Run with: npm run schedule
 */

import { AppKernel } from '@/backend/Console/Kernel';

class ScheduleRunner {
  private kernel: AppKernel;
  private running: boolean = false;
  private checkInterval: number = 60000; // Check every minute

  constructor() {
    this.kernel = new AppKernel();
  }

  /**
   * Start the schedule runner
   */
  async start(): Promise<void> {
    console.log('[Scheduler] Starting schedule runner...');
    console.log('[Scheduler] Checking for due tasks every minute');
    
    this.running = true;

    // Run immediately on start
    await this.tick();

    // Then continue checking every minute
    while (this.running) {
      await this.sleep(this.checkInterval);
      await this.tick();
    }

    console.log('[Scheduler] Scheduler stopped');
  }

  /**
   * Stop the runner
   */
  stop(): void {
    console.log('[Scheduler] Stopping scheduler...');
    this.running = false;
  }

  /**
   * Run a single tick (check for due tasks)
   */
  private async tick(): Promise<void> {
    const now = new Date();
    console.log(`[Scheduler] Tick at ${now.toISOString()}`);
    
    try {
      await this.kernel.runSchedule();
    } catch (error) {
      console.error('[Scheduler] Error running schedule:', error);
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

const scheduler = new ScheduleRunner();

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n[Scheduler] Received SIGINT. Gracefully shutting down...');
  scheduler.stop();
});

process.on('SIGTERM', () => {
  console.log('\n[Scheduler] Received SIGTERM. Gracefully shutting down...');
  scheduler.stop();
});

// Start the scheduler
scheduler.start().catch(console.error);

export { ScheduleRunner };
export default ScheduleRunner;
