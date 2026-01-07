/**
 * Catalyst Events Configuration
 *
 * Event and listener mappings following Laravel's EventServiceProvider pattern.
 */

export interface EventsConfig {
  /** Event to listener mappings */
  listen: Record<string, string[]>;
  /** Event subscribers */
  subscribe: string[];
  /** Whether to discover events automatically */
  shouldDiscoverEvents: boolean;
  /** Directories to search for event listeners */
  discoverEventsWithin: string[];
}

const config: EventsConfig = {
  listen: {
    // Example mappings:
    // 'UserRegistered': ['SendWelcomeEmail', 'LogUserRegistration'],
    // 'OrderPlaced': ['SendOrderConfirmation', 'UpdateInventory'],
  },

  subscribe: [
    // Event subscribers
  ],

  shouldDiscoverEvents: false,

  discoverEventsWithin: [
    'src/backend/Listeners',
  ],
};

export default config;
