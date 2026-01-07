/**
 * Catalyst Inertia-like Frontend Bridge
 * 
 * Provides seamless server-to-client data passing with page props,
 * flash messages, shared data, and navigation handling.
 */

import Context, { User } from '@/backend/Core/Context';

// ==================== TYPES ====================

export interface FlashMessage {
  success?: string;
  error?: string;
  warning?: string;
  info?: string;
}

export interface PageProps {
  auth: {
    user: User | null;
  };
  flash: FlashMessage;
  errors: Record<string, string[]>;
  [key: string]: unknown;
}

interface SharedData {
  [key: string]: unknown | (() => unknown | Promise<unknown>);
}

// ==================== INERTIA CLASS ====================

class Inertia {
  private static instance: Inertia | null = null;
  private sharedData: SharedData = {};

  private constructor() {}

  public static getInstance(): Inertia {
    if (!Inertia.instance) {
      Inertia.instance = new Inertia();
    }
    return Inertia.instance;
  }

  /**
   * Share data globally (available to all pages)
   * 
   * @param key - Key name or object of key-value pairs
   * @param value - Value or factory function
   */
  public share(key: string | SharedData, value?: unknown): this {
    if (typeof key === 'object') {
      Object.assign(this.sharedData, key);
    } else {
      this.sharedData[key] = value;
    }
    return this;
  }

  /**
   * Get shared data
   */
  public async getShared(): Promise<Record<string, unknown>> {
    const result: Record<string, unknown> = {};
    
    for (const [key, value] of Object.entries(this.sharedData)) {
      if (typeof value === 'function') {
        result[key] = await value();
      } else {
        result[key] = value;
      }
    }
    
    return result;
  }

  /**
   * Render a page with props
   * 
   * In Next.js context, this returns the props object that should
   * be passed to the page component via server components.
   */
  public async render(component: string, props: Record<string, unknown> = {}): Promise<{
    component: string;
    props: PageProps;
  }> {
    const shared = await this.getShared();
    const user = Context.user();
    const flash = Context.get('flash', {}) || {};
    const errors = Context.errors();

    const pageProps: PageProps = {
      ...shared,
      ...props,
      auth: {
        user,
      },
      flash,
      errors,
    };

    return {
      component,
      props: pageProps,
    };
  }

  /**
   * External redirect (full page reload)
   */
  public location(url: string): Response {
    return Response.redirect(url, 303);
  }

  /**
   * Create a lazy prop (only loaded when first accessed)
   */
  public lazy<T>(callback: () => T | Promise<T>): () => Promise<T> {
    let cached: T | undefined;
    let loaded = false;

    return async (): Promise<T> => {
      if (!loaded) {
        cached = await Promise.resolve(callback());
        loaded = true;
      }
      return cached as T;
    };
  }

  /**
   * Create a deferred prop (loaded in a separate request)
   */
  public defer<T>(callback: () => T | Promise<T>): { __deferred: true; loader: () => Promise<T> } {
    return {
      __deferred: true,
      loader: async () => Promise.resolve(callback()),
    };
  }
}

// ==================== ROUTE HELPER (Ziggy-like) ====================

interface RouteDefinition {
  uri: string;
  methods: string[];
  parameters?: string[];
}

interface RoutePayload {
  url: string;
  port: number | null;
  routes: Record<string, RouteDefinition>;
}

class Router {
  private static instance: Router | null = null;
  private routes: Record<string, RouteDefinition> = {};
  private baseUrl: string = '';

  private constructor() {
    this.baseUrl = process.env.APP_URL || 'http://localhost:3000';
    this.initializeRoutes();
  }

  public static getInstance(): Router {
    if (!Router.instance) {
      Router.instance = new Router();
    }
    return Router.instance;
  }

  /**
   * Initialize routes from Next.js app directory
   * In production, this would be generated at build time
   */
  private initializeRoutes(): void {
    // These would be auto-generated from the app directory
    this.routes = {
      'home': { uri: '/', methods: ['GET'], parameters: [] },
      'login': { uri: '/login', methods: ['GET'], parameters: [] },
      'register': { uri: '/register', methods: ['GET'], parameters: [] },
      'dashboard': { uri: '/dashboard', methods: ['GET'], parameters: [] },
      'users.index': { uri: '/users', methods: ['GET'], parameters: [] },
      'users.show': { uri: '/users/{id}', methods: ['GET'], parameters: ['id'] },
      'users.edit': { uri: '/users/{id}/edit', methods: ['GET'], parameters: ['id'] },
      'api.users.index': { uri: '/api/users', methods: ['GET'], parameters: [] },
      'api.users.store': { uri: '/api/users', methods: ['POST'], parameters: [] },
      'api.users.show': { uri: '/api/users/{id}', methods: ['GET'], parameters: ['id'] },
      'api.users.update': { uri: '/api/users/{id}', methods: ['PUT', 'PATCH'], parameters: ['id'] },
      'api.users.destroy': { uri: '/api/users/{id}', methods: ['DELETE'], parameters: ['id'] },
    };
  }

  /**
   * Register a route
   */
  public register(name: string, definition: RouteDefinition): this {
    this.routes[name] = definition;
    return this;
  }

  /**
   * Get the URL for a named route
   * 
   * @param name - Route name
   * @param params - Route parameters and query string
   * @param absolute - Whether to include the base URL
   */
  public url(
    name: string,
    params: Record<string, string | number> = {},
    absolute: boolean = true
  ): string {
    const route = this.routes[name];
    
    if (!route) {
      throw new Error(`Route [${name}] not defined.`);
    }

    // Replace URL parameters
    let uri = route.uri;
    const usedParams: string[] = [];

    for (const param of route.parameters || []) {
      if (params[param] !== undefined) {
        uri = uri.replace(`{${param}}`, String(params[param]));
        usedParams.push(param);
      } else {
        throw new Error(`Missing required parameter [${param}] for route [${name}].`);
      }
    }

    // Build query string from remaining params
    const queryParams = Object.entries(params)
      .filter(([key]) => !usedParams.includes(key))
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
      .join('&');

    if (queryParams) {
      uri += `?${queryParams}`;
    }

    return absolute ? `${this.baseUrl}${uri}` : uri;
  }

  /**
   * Check if a route exists
   */
  public has(name: string): boolean {
    return name in this.routes;
  }

  /**
   * Get the current route name
   */
  public current(): string | null {
    // In Next.js, this would check against the current pathname
    return null;
  }

  /**
   * Check if the current route matches a pattern
   */
  public is(pattern: string): boolean {
    const current = this.current();
    if (!current) return false;

    // Support wildcards: users.* matches users.index, users.show, etc.
    const regex = new RegExp(`^${pattern.replace('*', '.*')}$`);
    return regex.test(current);
  }

  /**
   * Get the route payload for client-side usage
   */
  public toPayload(): RoutePayload {
    const url = new URL(this.baseUrl);
    return {
      url: this.baseUrl,
      port: url.port ? parseInt(url.port, 10) : null,
      routes: this.routes,
    };
  }
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Get URL for a named route
 */
export function route(
  name: string,
  params: Record<string, string | number> = {},
  absolute: boolean = true
): string {
  return Router.getInstance().url(name, params, absolute);
}

/**
 * Check if a route exists
 */
export function routeHas(name: string): boolean {
  return Router.getInstance().has(name);
}

/**
 * Check if current route matches pattern
 */
export function routeIs(pattern: string): boolean {
  return Router.getInstance().is(pattern);
}

/**
 * Get the Inertia-like render function
 */
export function render(component: string, props?: Record<string, unknown>) {
  return Inertia.getInstance().render(component, props);
}

/**
 * Share data globally
 */
export function share(key: string | SharedData, value?: unknown) {
  return Inertia.getInstance().share(key, value);
}

// ==================== EXPORTS ====================

export const inertia = Inertia.getInstance();
export const router = Router.getInstance();
export { Inertia, Router };
export default Inertia;
