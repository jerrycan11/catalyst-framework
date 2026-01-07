/**
 * Catalyst Service Container
 * 
 * A powerful IoC (Inversion of Control) container for dependency injection.
 * Follows Laravel's container pattern with bindings, singletons, and aliases.
 * 
 * @example
 * ```ts
 * const container = Container.getInstance();
 * 
 * // Register a singleton
 * container.singleton('database', () => new DatabaseConnection());
 * 
 * // Register a regular binding
 * container.bind('logger', () => new Logger());
 * 
 * // Resolve dependencies
 * const db = container.make<DatabaseConnection>('database');
 * ```
 */

type Resolvable<T = unknown> = () => T | Promise<T>;
type ResolvableWithParams<T = unknown> = (container: Container, params?: Record<string, unknown>) => T | Promise<T>;

interface Binding {
  concrete: ResolvableWithParams;
  shared: boolean;
}

class Container {
  private static instance: Container | null = null;
  
  /** Registered bindings */
  private bindings: Map<string, Binding> = new Map();
  
  /** Singleton instances (shared instances) */
  private instances: Map<string, unknown> = new Map();
  
  /** Aliases for abstract types */
  private aliases: Map<string, string> = new Map();
  
  /** Resolved types tracking for circular dependency detection */
  private resolving: Set<string> = new Set();

  private constructor() {}

  /**
   * Get the singleton container instance
   */
  public static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  /**
   * Reset the container (useful for testing)
   */
  public static reset(): void {
    Container.instance = null;
  }

  /**
   * Register a binding in the container
   * 
   * @param abstract - The abstract type name
   * @param concrete - Factory function to create the instance
   * @param shared - Whether to share the instance (singleton)
   */
  public bind<T>(
    abstract: string,
    concrete: ResolvableWithParams<T>,
    shared: boolean = false
  ): this {
    this.bindings.set(abstract, {
      concrete: concrete as ResolvableWithParams,
      shared,
    });
    
    // Remove any cached instance when re-binding
    this.instances.delete(abstract);
    
    return this;
  }

  /**
   * Register a shared (singleton) binding
   * 
   * @param abstract - The abstract type name
   * @param concrete - Factory function to create the instance
   */
  public singleton<T>(abstract: string, concrete: ResolvableWithParams<T>): this {
    return this.bind(abstract, concrete, true);
  }

  /**
   * Register an existing instance in the container
   * 
   * @param abstract - The abstract type name
   * @param instance - The instance to register
   */
  public instance<T>(abstract: string, instance: T): T {
    this.instances.set(abstract, instance);
    return instance;
  }

  /**
   * Create an alias for an abstract type
   * 
   * @param alias - The alias name
   * @param abstract - The target abstract type
   */
  public alias(alias: string, abstract: string): this {
    this.aliases.set(alias, abstract);
    return this;
  }

  /**
   * Resolve a type from the container
   * 
   * @param abstract - The abstract type name (or alias)
   * @param parameters - Optional parameters to pass to the factory
   * @returns The resolved instance
   */
  public make<T>(abstract: string, parameters?: Record<string, unknown>): T {
    // Resolve aliases
    const resolved = this.getAlias(abstract);
    
    // Check for existing singleton instance
    if (this.instances.has(resolved)) {
      return this.instances.get(resolved) as T;
    }

    // Check for circular dependencies
    if (this.resolving.has(resolved)) {
      throw new Error(`Circular dependency detected while resolving: ${resolved}`);
    }

    // Get the binding
    const binding = this.bindings.get(resolved);
    
    if (!binding) {
      throw new Error(`No binding registered for: ${resolved}`);
    }

    // Mark as resolving
    this.resolving.add(resolved);

    try {
      // Build the instance
      const instance = binding.concrete(this, parameters) as T;

      // Cache if shared (singleton)
      if (binding.shared) {
        this.instances.set(resolved, instance);
      }

      return instance;
    } finally {
      // Remove from resolving set
      this.resolving.delete(resolved);
    }
  }

  /**
   * Async version of make for async factories
   */
  public async makeAsync<T>(abstract: string, parameters?: Record<string, unknown>): Promise<T> {
    const resolved = this.getAlias(abstract);
    
    if (this.instances.has(resolved)) {
      return this.instances.get(resolved) as T;
    }

    if (this.resolving.has(resolved)) {
      throw new Error(`Circular dependency detected while resolving: ${resolved}`);
    }

    const binding = this.bindings.get(resolved);
    
    if (!binding) {
      throw new Error(`No binding registered for: ${resolved}`);
    }

    this.resolving.add(resolved);

    try {
      const instance = await binding.concrete(this, parameters) as T;

      if (binding.shared) {
        this.instances.set(resolved, instance);
      }

      return instance;
    } finally {
      this.resolving.delete(resolved);
    }
  }

  /**
   * Check if a binding exists
   */
  public bound(abstract: string): boolean {
    const resolved = this.getAlias(abstract);
    return this.bindings.has(resolved) || this.instances.has(resolved);
  }

  /**
   * Check if an instance exists (singleton has been resolved)
   */
  public resolved(abstract: string): boolean {
    const resolved = this.getAlias(abstract);
    return this.instances.has(resolved);
  }

  /**
   * Remove a binding
   */
  public forget(abstract: string): void {
    const resolved = this.getAlias(abstract);
    this.bindings.delete(resolved);
    this.instances.delete(resolved);
  }

  /**
   * Flush the container of all bindings and instances
   */
  public flush(): void {
    this.bindings.clear();
    this.instances.clear();
    this.aliases.clear();
    this.resolving.clear();
  }

  /**
   * Get all registered bindings
   */
  public getBindings(): string[] {
    return [...this.bindings.keys()];
  }

  /**
   * Resolve the alias to the actual abstract type
   */
  private getAlias(abstract: string): string {
    if (this.aliases.has(abstract)) {
      return this.getAlias(this.aliases.get(abstract)!);
    }
    return abstract;
  }
}

// Export singleton accessor
export const container = Container.getInstance();

export default Container;
