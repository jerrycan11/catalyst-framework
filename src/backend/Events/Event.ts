/**
 * Catalyst Base Event Class
 *
 * Base class for all application events. Extend this class to create
 * custom events that can be dispatched and listened to.
 *
 * @example
 * ```ts
 * class UserRegistered extends Event {
 *   constructor(public user: User) {
 *     super();
 *   }
 * }
 *
 * // Dispatch the event
 * await Event.dispatch(new UserRegistered(user));
 * ```
 */

export abstract class Event {
  /** Timestamp when the event was created */
  public readonly timestamp: Date;

  /** Unique event ID */
  public readonly eventId: string;

  /** Whether the event should be queued */
  public shouldQueue: boolean = false;

  /** Queue name for queued events */
  public queue?: string;

  /** Whether propagation was stopped */
  private propagationStopped: boolean = false;

  constructor() {
    this.timestamp = new Date();
    this.eventId = this.generateId();
  }

  /**
   * Generate a unique event ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get the event name (class name by default)
   */
  public getName(): string {
    return this.constructor.name;
  }

  /**
   * Stop event propagation to remaining listeners
   */
  public stopPropagation(): void {
    this.propagationStopped = true;
  }

  /**
   * Check if propagation was stopped
   */
  public isPropagationStopped(): boolean {
    return this.propagationStopped;
  }

  /**
   * Mark this event to be queued
   */
  public onQueue(queue?: string): this {
    this.shouldQueue = true;
    this.queue = queue;
    return this;
  }

  /**
   * Serialize event for queuing
   */
  public serialize(): string {
    return JSON.stringify({
      name: this.getName(),
      data: this.toJSON(),
      timestamp: this.timestamp.toISOString(),
      eventId: this.eventId,
    });
  }

  /**
   * Convert event to JSON
   */
  public toJSON(): Record<string, unknown> {
    const data: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(this)) {
      if (key !== 'propagationStopped') {
        data[key] = value;
      }
    }
    return data;
  }
}

export default Event;
