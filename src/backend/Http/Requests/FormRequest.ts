/**
 * Catalyst Form Request Validation
 * 
 * Provides Laravel-like form request validation using Zod schemas.
 * Includes standard validation rules and form request lifecycle handling.
 */

import { z, ZodError, ZodSchema, ZodTypeAny } from 'zod';
import Context from '@/backend/Core/Context';

// ==================== VALIDATION RESULT ====================

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: Record<string, string[]>;
}

// ==================== VALIDATION EXCEPTION ====================

export class ValidationException extends Error {
  public errors: Record<string, string[]>;
  public status: number = 422;

  constructor(errors: Record<string, string[]>) {
    super('The given data was invalid.');
    this.name = 'ValidationException';
    this.errors = errors;
  }

  /**
   * Get the first error for each field
   */
  public messages(): Record<string, string> {
    const messages: Record<string, string> = {};
    for (const [field, fieldErrors] of Object.entries(this.errors)) {
      messages[field] = fieldErrors[0];
    }
    return messages;
  }
}

// ==================== VALIDATOR ====================

export class Validator<T extends ZodTypeAny> {
  private schema: T;
  private customMessages: Record<string, string> = {};

  constructor(schema: T) {
    this.schema = schema;
  }

  /**
   * Set custom error messages
   */
  public messages(messages: Record<string, string>): this {
    this.customMessages = messages;
    return this;
  }

  /**
   * Validate data and return result
   */
  public validate(data: unknown): ValidationResult<z.infer<T>> {
    const result = this.schema.safeParse(data);

    if (result.success) {
      return { success: true, data: result.data };
    }

    const errors = this.formatErrors(result.error);
    return { success: false, errors };
  }

  /**
   * Validate data and throw on failure
   */
  public validated(data: unknown): z.infer<T> {
    const result = this.validate(data);
    
    if (!result.success) {
      throw new ValidationException(result.errors!);
    }

    return result.data!;
  }

  /**
   * Check if validation passes
   */
  public passes(data: unknown): boolean {
    return this.validate(data).success;
  }

  /**
   * Check if validation fails
   */
  public fails(data: unknown): boolean {
    return !this.passes(data);
  }

  /**
   * Format Zod errors into Laravel-style error format
   */
  private formatErrors(error: ZodError): Record<string, string[]> {
    const errors: Record<string, string[]> = {};

    for (const issue of error.issues) {
      const path = issue.path.join('.');
      const key = path || '_root';
      
      if (!errors[key]) {
        errors[key] = [];
      }

      // Check for custom message
      const customKey = `${path}.${issue.code}`;
      const message = this.customMessages[customKey] || this.customMessages[path] || issue.message;
      
      errors[key].push(message);
    }

    return errors;
  }
}

// ==================== COMMON RULES (Zod Extensions) ====================

export const rules = {
  /**
   * Required string
   */
  required: () => z.string().min(1, 'This field is required'),

  /**
   * Nullable field
   */
  nullable: <T extends ZodTypeAny>(schema: T) => schema.nullable(),

  /**
   * String with min/max length
   */
  string: (options?: { min?: number; max?: number }) => {
    let schema = z.string();
    if (options?.min !== undefined) {
      schema = schema.min(options.min, `Must be at least ${options.min} characters`);
    }
    if (options?.max !== undefined) {
      schema = schema.max(options.max, `Must be at most ${options.max} characters`);
    }
    return schema;
  },

  /**
   * Integer
   */
  integer: () => z.number().int('Must be an integer'),

  /**
   * Boolean
   */
  boolean: () => z.boolean(),

  /**
   * Email
   */
  email: () => z.string().email('Invalid email address'),

  /**
   * URL
   */
  url: () => z.string().url('Invalid URL'),

  /**
   * IP address (v4 or v6)
   */
  ip: () => z.string().ip('Invalid IP address'),

  /**
   * UUID
   */
  uuid: () => z.string().uuid('Invalid UUID'),

  /**
   * Min value
   */
  min: (value: number) => z.number().min(value, `Must be at least ${value}`),

  /**
   * Max value
   */
  max: (value: number) => z.number().max(value, `Must be at most ${value}`),

  /**
   * Between min and max
   */
  between: (min: number, max: number) => 
    z.number()
      .min(min, `Must be at least ${min}`)
      .max(max, `Must be at most ${max}`),

  /**
   * In array of values
   */
  in: <T extends readonly [string, ...string[]]>(values: T) => 
    z.enum(values, { errorMap: () => ({ message: `Must be one of: ${values.join(', ')}` }) }),

  /**
   * Not in array of values
   */
  notIn: <T extends string>(values: readonly T[]) => 
    z.string().refine(
      (val) => !values.includes(val as T),
      { message: `Must not be one of: ${values.join(', ')}` }
    ),

  /**
   * Unique in table (placeholder - requires database integration)
   */
  unique: (table: string, column: string) => 
    z.string().refine(
      async () => {
        // TODO: Check database for uniqueness
        return true;
      },
      { message: `The ${column} has already been taken` }
    ),

  /**
   * Exists in table (placeholder - requires database integration)
   */
  exists: (table: string, column: string) => 
    z.string().refine(
      async () => {
        // TODO: Check database for existence
        return true;
      },
      { message: `The selected ${column} is invalid` }
    ),

  /**
   * Password with confirmation
   */
  password: (minLength: number = 8) => 
    z.string()
      .min(minLength, `Password must be at least ${minLength} characters`)
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),

  /**
   * Confirmed field (field + field_confirmation must match)
   */
  confirmed: (field: string) => 
    z.object({
      [field]: z.string(),
      [`${field}_confirmation`]: z.string(),
    }).refine(
      (data) => data[field] === data[`${field}_confirmation`],
      { message: `The ${field} confirmation does not match`, path: [`${field}_confirmation`] }
    ),

  /**
   * Date validation
   */
  date: () => z.coerce.date({ message: 'Invalid date' }),

  /**
   * After date
   */
  after: (date: Date | string) => {
    const compareDate = new Date(date);
    return z.coerce.date().refine(
      (val) => val > compareDate,
      { message: `Must be after ${compareDate.toISOString().split('T')[0]}` }
    );
  },

  /**
   * Before date
   */
  before: (date: Date | string) => {
    const compareDate = new Date(date);
    return z.coerce.date().refine(
      (val) => val < compareDate,
      { message: `Must be before ${compareDate.toISOString().split('T')[0]}` }
    );
  },

  /**
   * Array validation
   */
  array: <T extends ZodTypeAny>(schema: T) => z.array(schema),

  /**
   * File validation (for form data)
   */
  file: (options?: { maxSize?: number; mimes?: string[] }) => 
    z.custom<File>(
      (val) => val instanceof File,
      { message: 'Invalid file' }
    ).refine(
      (file) => !options?.maxSize || file.size <= options.maxSize,
      { message: `File must be at most ${options?.maxSize} bytes` }
    ).refine(
      (file) => !options?.mimes || options.mimes.some(mime => file.type.includes(mime)),
      { message: `File type must be: ${options?.mimes?.join(', ')}` }
    ),

  /**
   * Image file
   */
  image: (maxSize?: number) => rules.file({
    maxSize,
    mimes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  }),
};

// ==================== FORM REQUEST BASE CLASS ====================

export abstract class FormRequest<T extends ZodTypeAny = ZodTypeAny> {
  protected abstract schema: T;

  /**
   * Get custom error messages
   */
  protected messages(): Record<string, string> {
    return {};
  }

  /**
   * Determine if the user is authorized to make this request
   */
  protected authorize(): boolean | Promise<boolean> {
    return true;
  }

  /**
   * Get the validation rules
   */
  public rules(): T {
    return this.schema;
  }

  /**
   * Validate the request
   */
  public async validate(data: unknown): Promise<ValidationResult<z.infer<T>>> {
    // Check authorization
    const authorized = await this.authorize();
    if (!authorized) {
      return {
        success: false,
        errors: { _authorization: ['This action is unauthorized.'] },
      };
    }

    // Validate data
    const validator = new Validator(this.schema).messages(this.messages());
    return validator.validate(data);
  }

  /**
   * Validate and throw on failure
   */
  public async validated(data: unknown): Promise<z.infer<T>> {
    const result = await this.validate(data);

    if (!result.success) {
      // Set errors in context
      Context.withErrors(result.errors!);
      
      throw new ValidationException(result.errors!);
    }

    return result.data!;
  }
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Create a validator from a Zod schema
 */
export function validate<T extends ZodTypeAny>(schema: T): Validator<T> {
  return new Validator(schema);
}

/**
 * Quick validation helper
 */
export async function validateData<T extends ZodSchema>(
  data: unknown,
  schema: T
): Promise<ValidationResult<z.infer<T>>> {
  return new Validator(schema).validate(data);
}

// Re-export Zod for convenience
export { z };
