/**
 * Catalyst Console Kernel
 * 
 * Task scheduler with cron-like frequency helpers.
 * Manages scheduled commands and artisan-style console commands.
 */

import * as fs from 'fs';
import * as path from 'path';

// ==================== SCHEDULE EVENT ====================

type ScheduleCallback = () => void | Promise<void>;

interface ScheduleEvent {
  command: string | ScheduleCallback;
  expression: string;
  timezone?: string;
  description?: string;
  outputPath?: string;
  emailOnFailure?: string;
  runInBackground: boolean;
  withoutOverlapping: boolean;
  evenInMaintenanceMode: boolean;
  enabled: boolean;
}

class Event {
  private event: ScheduleEvent;

  constructor(command: string | ScheduleCallback) {
    this.event = {
      command,
      expression: '* * * * *', // Every minute by default
      runInBackground: false,
      withoutOverlapping: false,
      evenInMaintenanceMode: false,
      enabled: true,
    };
  }

  // ==================== FREQUENCY METHODS ====================

  /**
   * Run the command every minute
   */
  everyMinute(): this {
    this.event.expression = '* * * * *';
    return this;
  }

  /**
   * Run the command every two minutes
   */
  everyTwoMinutes(): this {
    this.event.expression = '*/2 * * * *';
    return this;
  }

  /**
   * Run the command every five minutes
   */
  everyFiveMinutes(): this {
    this.event.expression = '*/5 * * * *';
    return this;
  }

  /**
   * Run the command every ten minutes
   */
  everyTenMinutes(): this {
    this.event.expression = '*/10 * * * *';
    return this;
  }

  /**
   * Run the command every fifteen minutes
   */
  everyFifteenMinutes(): this {
    this.event.expression = '*/15 * * * *';
    return this;
  }

  /**
   * Run the command every thirty minutes
   */
  everyThirtyMinutes(): this {
    this.event.expression = '*/30 * * * *';
    return this;
  }

  /**
   * Run the command hourly
   */
  hourly(): this {
    this.event.expression = '0 * * * *';
    return this;
  }

  /**
   * Run the command hourly at a specific minute
   */
  hourlyAt(minute: number): this {
    this.event.expression = `${minute} * * * *`;
    return this;
  }

  /**
   * Run the command daily at midnight
   */
  daily(): this {
    this.event.expression = '0 0 * * *';
    return this;
  }

  /**
   * Run the command daily at a specific time
   */
  dailyAt(time: string): this {
    const [hour, minute] = time.split(':').map(Number);
    this.event.expression = `${minute || 0} ${hour} * * *`;
    return this;
  }

  /**
   * Run the command twice daily
   */
  twiceDaily(first: number = 1, second: number = 13): this {
    this.event.expression = `0 ${first},${second} * * *`;
    return this;
  }

  /**
   * Run the command weekly on Sunday
   */
  weekly(): this {
    this.event.expression = '0 0 * * 0';
    return this;
  }

  /**
   * Run the command weekly on a specific day and time
   */
  weeklyOn(day: number, time: string = '0:0'): this {
    const [hour, minute] = time.split(':').map(Number);
    this.event.expression = `${minute || 0} ${hour} * * ${day}`;
    return this;
  }

  /**
   * Run the command monthly
   */
  monthly(): this {
    this.event.expression = '0 0 1 * *';
    return this;
  }

  /**
   * Run the command monthly on a specific day and time
   */
  monthlyOn(day: number = 1, time: string = '0:0'): this {
    const [hour, minute] = time.split(':').map(Number);
    this.event.expression = `${minute || 0} ${hour} ${day} * *`;
    return this;
  }

  /**
   * Run the command quarterly
   */
  quarterly(): this {
    this.event.expression = '0 0 1 1,4,7,10 *';
    return this;
  }

  /**
   * Run the command yearly
   */
  yearly(): this {
    this.event.expression = '0 0 1 1 *';
    return this;
  }

  /**
   * Set a custom cron expression
   */
  cron(expression: string): this {
    this.event.expression = expression;
    return this;
  }

  // ==================== OUTPUT METHODS ====================

  /**
   * Append output to a file
   */
  appendOutputTo(path: string): this {
    this.event.outputPath = path;
    return this;
  }

  /**
   * Email output on failure
   */
  emailOutputTo(email: string): this {
    this.event.emailOnFailure = email;
    return this;
  }

  // ==================== CONSTRAINT METHODS ====================

  /**
   * Set the timezone
   */
  timezone(tz: string): this {
    this.event.timezone = tz;
    return this;
  }

  /**
   * Add a description
   */
  description(desc: string): this {
    this.event.description = desc;
    return this;
  }

  /**
   * Run in the background
   */
  runInBackground(): this {
    this.event.runInBackground = true;
    return this;
  }

  /**
   * Prevent overlapping executions
   */
  withoutOverlapping(): this {
    this.event.withoutOverlapping = true;
    return this;
  }

  /**
   * Run even in maintenance mode
   */
  evenInMaintenanceMode(): this {
    this.event.evenInMaintenanceMode = true;
    return this;
  }

  /**
   * Run only when a condition is true
   */
  when(callback: () => boolean): this {
    this.event.enabled = callback();
    return this;
  }

  /**
   * Skip when a condition is true
   */
  skip(callback: () => boolean): this {
    this.event.enabled = !callback();
    return this;
  }

  /**
   * Get the event definition
   */
  getEvent(): ScheduleEvent {
    return this.event;
  }
}

// ==================== SCHEDULE CLASS ====================

class Schedule {
  private events: Event[] = [];

  /**
   * Schedule a command to run
   */
  command(command: string): Event {
    const event = new Event(command);
    this.events.push(event);
    return event;
  }

  /**
   * Schedule a callback to run
   */
  call(callback: ScheduleCallback): Event {
    const event = new Event(callback);
    this.events.push(event);
    return event;
  }

  /**
   * Get all scheduled events
   */
  getEvents(): Event[] {
    return this.events;
  }

  /**
   * Check if any events are due
   */
  dueEvents(): Event[] {
    return this.events.filter(event => {
      const def = event.getEvent();
      if (!def.enabled) return false;
      return this.isDue(def.expression);
    });
  }

  /**
   * Check if a cron expression is due
   */
  private isDue(expression: string): boolean {
    const now = new Date();
    const [minute, hour, dayOfMonth, month, dayOfWeek] = expression.split(' ');

    return (
      this.matchesPart(now.getMinutes(), minute) &&
      this.matchesPart(now.getHours(), hour) &&
      this.matchesPart(now.getDate(), dayOfMonth) &&
      this.matchesPart(now.getMonth() + 1, month) &&
      this.matchesPart(now.getDay(), dayOfWeek)
    );
  }

  /**
   * Check if a value matches a cron part
   */
  private matchesPart(value: number, pattern: string): boolean {
    if (pattern === '*') return true;

    // Handle step values (*/5)
    if (pattern.startsWith('*/')) {
      const step = parseInt(pattern.slice(2), 10);
      return value % step === 0;
    }

    // Handle comma-separated values
    if (pattern.includes(',')) {
      return pattern.split(',').map(Number).includes(value);
    }

    // Handle ranges
    if (pattern.includes('-')) {
      const [start, end] = pattern.split('-').map(Number);
      return value >= start && value <= end;
    }

    return value === parseInt(pattern, 10);
  }
}

// ==================== CONSOLE KERNEL ====================

export abstract class Kernel {
  protected _schedule: Schedule = new Schedule();
  private maintenanceMode: boolean = false;

  constructor() {
    this.configureSchedule();
  }

  /**
   * Define the application's command schedule
   */
  protected abstract defineSchedule(schedule: Schedule): void;

  private configureSchedule(): void {
    this.defineSchedule(this._schedule);
  }

  /**
   * Run due scheduled events
   */
  async runSchedule(): Promise<void> {
    const dueEvents = this._schedule.dueEvents();

    for (const event of dueEvents) {
      const def = event.getEvent();

      // Skip if in maintenance mode and not allowed
      if (this.maintenanceMode && !def.evenInMaintenanceMode) {
        continue;
      }

      try {
        if (typeof def.command === 'string') {
          console.log(`[Schedule] Running: ${def.command}`);
          // Execute command
        } else {
          console.log(`[Schedule] Running callback: ${def.description || 'anonymous'}`);
          await def.command();
        }

        // Write output if configured
        if (def.outputPath) {
          fs.appendFileSync(def.outputPath, `[${new Date().toISOString()}] Completed\n`);
        }
      } catch (error) {
        console.error(`[Schedule] Failed:`, error);

        // Email on failure if configured
        if (def.emailOnFailure) {
          // TODO: Send email notification
        }
      }
    }
  }

  /**
   * Put the application in maintenance mode
   */
  down(): void {
    this.maintenanceMode = true;
    console.log('[Maintenance] Application is now in maintenance mode');
  }

  /**
   * Bring the application out of maintenance mode
   */
  up(): void {
    this.maintenanceMode = false;
    console.log('[Maintenance] Application is now live');
  }

  /**
   * Check if in maintenance mode
   */
  isDown(): boolean {
    return this.maintenanceMode;
  }
}

// ==================== DEFAULT KERNEL IMPLEMENTATION ====================

export class AppKernel extends Kernel {
  protected defineSchedule(schedule: Schedule): void {
    // Example scheduled tasks

    // Run database cleanup daily at 3am
    schedule.command('db:prune')
      .dailyAt('3:00')
      .description('Clean up old database records');

    // Run queue monitoring every 5 minutes
    schedule.call(async () => {
      console.log('[Monitor] Checking queue health...');
    })
      .everyFiveMinutes()
      .description('Monitor queue health');

    // Clear cache weekly
    schedule.command('cache:clear')
      .weekly()
      .description('Clear application cache');
  }
}

export { Schedule, Event };
export default Kernel;
