/**
 * Catalyst Event Subscriber Class
 *
 * Subscribers can register multiple event listeners in one class.
 * Useful for grouping related event handlers together.
 *
 * @example
 * ```ts
 * class UserEventSubscriber extends Subscriber {
 *   subscribe(dispatcher: EventDispatcher): void {
 *     dispatcher.listen(UserRegistered, this.onUserRegistered.bind(this));
 *     dispatcher.listen(UserDeleted, this.onUserDeleted.bind(this));
 *   }
 *
 *   async onUserRegistered(event: UserRegistered): Promise<void> {
 *     // Handle user registration
 *   }
 *
 *   async onUserDeleted(event: UserDeleted): Promise<void> {
 *     // Handle user deletion
 *   }
 * }
 * ```
 */

import type { EventDispatcher } from './Dispatcher';

export abstract class Subscriber {
  /**
   * Register event listeners with the dispatcher
   */
  abstract subscribe(dispatcher: EventDispatcher): void;
}

export default Subscriber;
