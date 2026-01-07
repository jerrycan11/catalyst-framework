/**
 * Catalyst Event Dispatcher
 *
 * Central event dispatcher for the application. Manages event listeners
 * and dispatches events to registered handlers.
 *
 * @example
 * ```ts
 * import { EventDispatcher } from '@/backend/Events/Dispatcher';
 *
 * // Register a listener
 * EventDispatcher.listen(UserRegistered, async (event) => {
 *   console.log('User registered:', event.user.email);
 * });
 *
 * // Or register a Listener class
 * EventDispatcher.listen(UserRegistered, SendWelcomeEmail);
 *
 * // Dispatch an event
 * await EventDispatcher.dispatch(new UserRegistered(user));
 * ```
 */

import { Event } from './Event';
import { Listener } from './Listener';
import { Subscriber } from './Subscriber';
import { Log } from '../Services/Logger';

type EventClass = new (...args: unknown[]) => Event;
type ListenerClass = new () => Listener;
type ListenerCallback = (event: Event) => Promise<void> | void;
type ListenerType = ListenerClass | ListenerCallback;

interface QueuedEvent {
  event: Event;
  listener: ListenerType;
}

export class EventDispatcher {
  private static instance: EventDispatcher | null = null;
  private listeners: Map<string, ListenerType[]> = new Map();
  private wildcardListeners: ListenerCallback[] = [];
  private queuedEvents: QueuedEvent[] = [];
  private fakeMode: boolean = false;
  private firedEvents: Event[] = [];

  private constructor() {}

  /**
   * Get the singleton instance
   */
  public static getInstance(): EventDispatcher {
    if (!EventDispatcher.instance) {
      EventDispatcher.instance = new EventDispatcher();
    }
    return EventDispatcher.instance;
  }

  /**
   * Reset the singleton instance (for testing)
   */
  public static reset(): void {
    EventDispatcher.instance = null;
  }

  /**
   * Register a listener for an event
   */
  public listen(event: EventClass | string, listener: ListenerType): this {
    const eventName = typeof event === 'string' ? event : event.name;
    const listeners = this.listeners.get(eventName) || [];
    listeners.push(listener);
    this.listeners.set(eventName, listeners);
    return this;
  }

  /**
   * Register a listener for all events (wildcard)
   */
  public listenToAll(listener: ListenerCallback): this {
    this.wildcardListeners.push(listener);
    return this;
  }

  /**
   * Register a subscriber
   */
  public subscribe(subscriber: Subscriber | (new () => Subscriber)): this {
    const instance = typeof subscriber === 'function' ? new subscriber() : subscriber;
    instance.subscribe(this);
    return this;
  }

  /**
   * Check if an event has listeners
   */
  public hasListeners(event: EventClass | string): boolean {
    const eventName = typeof event === 'string' ? event : event.name;
    const listeners = this.listeners.get(eventName) || [];
    return listeners.length > 0 || this.wildcardListeners.length > 0;
  }

  /**
   * Get all listeners for an event
   */
  public getListeners(event: EventClass | string): ListenerType[] {
    const eventName = typeof event === 'string' ? event : event.name;
    return this.listeners.get(eventName) || [];
  }

  /**
   * Remove a listener for an event
   */
  public forget(event: EventClass | string, listener?: ListenerType): this {
    const eventName = typeof event === 'string' ? event : event.name;

    if (listener) {
      const listeners = this.listeners.get(eventName) || [];
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
        this.listeners.set(eventName, listeners);
      }
    } else {
      this.listeners.delete(eventName);
    }

    return this;
  }

  /**
   * Remove all listeners
   */
  public flush(): this {
    this.listeners.clear();
    this.wildcardListeners = [];
    return this;
  }

  /**
   * Dispatch an event to all registered listeners
   */
  public async dispatch(event: Event): Promise<void> {
    // In fake mode, just record the event
    if (this.fakeMode) {
      this.firedEvents.push(event);
      return;
    }

    const eventName = event.getName();

    Log.debug(`Dispatching event: ${eventName}`, {
      eventId: event.eventId,
    });

    // Get listeners for this specific event
    const listeners = this.listeners.get(eventName) || [];

    // Process all listeners
    for (const listener of listeners) {
      if (event.isPropagationStopped()) {
        break;
      }

      await this.invokeListener(listener, event);
    }

    // Process wildcard listeners
    for (const listener of this.wildcardListeners) {
      if (event.isPropagationStopped()) {
        break;
      }

      await this.invokeListener(listener, event);
    }
  }

  /**
   * Dispatch multiple events
   */
  public async dispatchMany(events: Event[]): Promise<void> {
    for (const event of events) {
      await this.dispatch(event);
    }
  }

  /**
   * Dispatch an event if a condition is true
   */
  public async dispatchIf(condition: boolean, event: Event): Promise<void> {
    if (condition) {
      await this.dispatch(event);
    }
  }

  /**
   * Dispatch an event unless a condition is true
   */
  public async dispatchUnless(condition: boolean, event: Event): Promise<void> {
    if (!condition) {
      await this.dispatch(event);
    }
  }

  /**
   * Invoke a listener with an event
   */
  private async invokeListener(listener: ListenerType, event: Event): Promise<void> {
    try {
      if (typeof listener === 'function' && !this.isListenerClass(listener)) {
        // Direct callback
        await listener(event);
      } else {
        // Listener class
        const instance = new (listener as ListenerClass)();

        // Check if listener should handle the event
        if (!instance.shouldHandle(event)) {
          return;
        }

        // Check if listener should be queued
        if (instance.shouldQueue || event.shouldQueue) {
          this.queuedEvents.push({ event, listener });
          Log.debug(`Event queued: ${event.getName()}`, {
            eventId: event.eventId,
            listener: (listener as ListenerClass).name,
          });
          return;
        }

        // Execute with retries if configured
        let lastError: Error | null = null;
        for (let attempt = 1; attempt <= instance.tries; attempt++) {
          try {
            await instance.handle(event);
            return;
          } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));
            if (attempt < instance.tries && instance.retryDelay > 0) {
              await this.sleep(instance.retryDelay * 1000);
            }
          }
        }

        // All retries failed
        if (lastError) {
          instance.failed(event, lastError);
          throw lastError;
        }
      }
    } catch (error) {
      Log.error(`Error handling event: ${event.getName()}`, {
        eventId: event.eventId,
        listener: typeof listener === 'function' ? listener.name : 'callback',
      }, error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Check if a function is a Listener class
   */
  private isListenerClass(fn: ListenerType): fn is ListenerClass {
    return typeof fn === 'function' && fn.prototype instanceof Listener;
  }

  /**
   * Sleep helper
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Process queued events
   */
  public async processQueue(): Promise<number> {
    const events = [...this.queuedEvents];
    this.queuedEvents = [];

    for (const { event, listener } of events) {
      await this.invokeListener(listener, event);
    }

    return events.length;
  }

  /**
   * Get the number of queued events
   */
  public queueCount(): number {
    return this.queuedEvents.length;
  }

  // ==================== TESTING HELPERS ====================

  /**
   * Enable fake mode for testing
   */
  public fake(): this {
    this.fakeMode = true;
    this.firedEvents = [];
    return this;
  }

  /**
   * Disable fake mode
   */
  public unfake(): this {
    this.fakeMode = false;
    return this;
  }

  /**
   * Check if in fake mode
   */
  public isFake(): boolean {
    return this.fakeMode;
  }

  /**
   * Get fired events (only in fake mode)
   */
  public fired(): Event[] {
    if (!this.fakeMode) {
      throw new Error('fired() is only available in fake mode. Call fake() first.');
    }
    return [...this.firedEvents];
  }

  /**
   * Assert an event was dispatched
   */
  public assertDispatched(eventClass: EventClass, count?: number): boolean {
    if (!this.fakeMode) {
      throw new Error('Assertions are only available in fake mode. Call fake() first.');
    }

    const matching = this.firedEvents.filter((e) => e instanceof eventClass);

    if (count !== undefined) {
      if (matching.length !== count) {
        throw new Error(
          `Expected ${eventClass.name} to be dispatched ${count} times, but was dispatched ${matching.length} times.`
        );
      }
    } else if (matching.length === 0) {
      throw new Error(`Expected ${eventClass.name} to be dispatched, but it was not.`);
    }

    return true;
  }

  /**
   * Assert an event was not dispatched
   */
  public assertNotDispatched(eventClass: EventClass): boolean {
    if (!this.fakeMode) {
      throw new Error('Assertions are only available in fake mode. Call fake() first.');
    }

    const matching = this.firedEvents.filter((e) => e instanceof eventClass);

    if (matching.length > 0) {
      throw new Error(
        `Expected ${eventClass.name} not to be dispatched, but it was dispatched ${matching.length} times.`
      );
    }

    return true;
  }

  /**
   * Assert no events were dispatched
   */
  public assertNothingDispatched(): boolean {
    if (!this.fakeMode) {
      throw new Error('Assertions are only available in fake mode. Call fake() first.');
    }

    if (this.firedEvents.length > 0) {
      const eventNames = this.firedEvents.map((e) => e.getName()).join(', ');
      throw new Error(
        `Expected no events to be dispatched, but the following were dispatched: ${eventNames}`
      );
    }

    return true;
  }
}

// Export singleton accessors
export const Events = EventDispatcher.getInstance();

// Convenience functions
export const dispatch = (event: Event) => Events.dispatch(event);
export const listen = (event: EventClass | string, listener: ListenerType) =>
  Events.listen(event, listener);

export default EventDispatcher;
