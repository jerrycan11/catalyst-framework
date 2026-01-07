/**
 * Catalyst Middleware Pipeline
 * 
 * Implements the "Onion" architecture for processing requests through
 * a stack of middleware. Each middleware can inspect/modify the request
 * and response, or terminate the pipeline early.
 * 
 * @example
 * ```ts
 * const response = await new Pipeline()
 *   .send(request)
 *   .through([
 *     AuthMiddleware,
 *     LoggingMiddleware,
 *     TrimStringsMiddleware,
 *   ])
 *   .then((req) => handleRequest(req));
 * ```
 */

import { NextRequest, NextResponse } from 'next/server';

export type NextFunction = () => Promise<NextResponse> | NextResponse;

export interface Middleware {
  /**
   * Handle the request
   * 
   * @param request - The incoming request
   * @param next - Callback to pass control to the next middleware
   * @returns Response or passes to next middleware
   */
  handle(request: NextRequest, next: NextFunction): Promise<NextResponse> | NextResponse;
}

export type MiddlewareClass = new () => Middleware;
export type MiddlewareClosure = (request: NextRequest, next: NextFunction) => Promise<NextResponse> | NextResponse;
export type MiddlewareDefinition = MiddlewareClass | MiddlewareClosure | Middleware;

class Pipeline {
  /** The object being passed through the pipeline */
  private passable: NextRequest | null = null;

  /** The array of middleware to process */
  private pipes: MiddlewareDefinition[] = [];

  /**
   * Set the object being sent through the pipeline
   */
  public send(passable: NextRequest): this {
    this.passable = passable;
    return this;
  }

  /**
   * Set the middleware stack
   */
  public through(pipes: MiddlewareDefinition[]): this {
    this.pipes = pipes;
    return this;
  }

  /**
   * Add middleware to the stack
   */
  public pipe(pipe: MiddlewareDefinition): this {
    this.pipes.push(pipe);
    return this;
  }

  /**
   * Run the pipeline with a final destination callback
   * 
   * @param destination - The final handler after all middleware
   */
  public async then(
    destination: (request: NextRequest) => Promise<NextResponse> | NextResponse
  ): Promise<NextResponse> {
    if (!this.passable) {
      throw new Error('Pipeline: No passable object set. Call send() first.');
    }

    const pipeline = this.pipes.reduceRight<NextFunction>(
      (next, pipe) => {
        return async () => {
          const middleware = this.resolveMiddleware(pipe);
          return middleware.handle(this.passable!, next);
        };
      },
      async () => destination(this.passable!)
    );

    return pipeline();
  }

  /**
   * Resolve a middleware definition to an instance
   */
  private resolveMiddleware(pipe: MiddlewareDefinition): Middleware {
    // Already an instance
    if (typeof pipe === 'object' && 'handle' in pipe) {
      return pipe;
    }

    // Closure
    if (typeof pipe === 'function' && !this.isClass(pipe)) {
      return {
        handle: pipe as MiddlewareClosure,
      };
    }

    // Class
    if (typeof pipe === 'function' && this.isClass(pipe)) {
      return new (pipe as MiddlewareClass)();
    }

    throw new Error(`Pipeline: Invalid middleware type`);
  }

  /**
   * Check if a function is a class constructor
   */
  private isClass(func: Function): boolean {
    return /^class\s/.test(Function.prototype.toString.call(func));
  }
}

/**
 * Create a new pipeline instance
 */
export function pipeline(): Pipeline {
  return new Pipeline();
}

export default Pipeline;
