/**
 * Catalyst Base Listener Class
 *
 * Base class for event listeners. Extend this class to create
 * listeners that respond to specific events.
 *
 * @example
 * ```ts
 * class SendWelcomeEmail extends Listener {
 *   async handle(event: UserRegistered): Promise<void> {
 *     await Mail.send(new WelcomeEmail(event.user));
 *   }
 * }
 * ```
 */

import { Event } from './Event';

export abstract class Listener {
  /** Whether the listener should be queued */
  public shouldQueue: boolean = false;

  /** Queue name for queued listeners */
  public queue?: string;

  /** Number of times to retry on failure */
  public tries: number = 1;

  /** Delay between retries in seconds */
  public retryDelay: number = 0;

  /**
   * Handle the event
   */
  abstract handle(event: Event): Promise<void> | void;

  /**
   * Determine if the listener should handle the event
   */
  public shouldHandle(_event: Event): boolean {
    return true;
  }

  /**
   * Handle a failed event
   */
  public failed(_event: Event, _error: Error): void {
    // Override to handle failures
  }

  /**
   * Mark this listener to be queued
   */
  public onQueue(queue?: string): this {
    this.shouldQueue = true;
    this.queue = queue;
    return this;
  }

  /**
   * Set the number of retry attempts
   */
  public withRetries(tries: number, delay: number = 0): this {
    this.tries = tries;
    this.retryDelay = delay;
    return this;
  }
}

export default Listener;
