/**
 * Catalyst Base Model
 *
 * Active Record-style wrapper around Drizzle ORM providing Laravel-like
 * model patterns including fillable/guarded, casts, scopes, relationships, and events.
 *
 * @example
 * ```ts
 * class User extends Model<UserAttributes> {
 *   protected table = 'users';
 *   protected fillable = ['name', 'email'];
 *   protected hidden = ['password'];
 *   protected casts = { created_at: 'datetime' };
 *
 *   // Define relationships
 *   posts(): Promise<Post[]> {
 *     return this.hasMany(Post, 'user_id');
 *   }
 * }
 *
 * // Usage
 * const user = await User.find('123');
 * const users = await User.query().where('active', true).get();
 * await user.posts(); // Relationship
 * ```
 */

import { db, dbWrite } from '@/database';
import { eq, and, or, like, gt, gte, lt, lte, ne, inArray, isNull, isNotNull, sql } from 'drizzle-orm';
import type { SQLiteTable, SQLiteColumn } from 'drizzle-orm/sqlite-core';
import * as schema from '@/database/schema';

type EventCallback<T> = (model: T) => void | Promise<void>;
type WhereOperator = '=' | '!=' | '<' | '<=' | '>' | '>=' | 'like' | 'in' | 'not in' | 'is null' | 'is not null';

export interface QueryBuilderOptions {
  table: SQLiteTable;
  primaryKey: string;
}

/**
 * Query Builder for fluent database queries
 */
export class QueryBuilder<TAttributes extends Record<string, unknown>> {
  private conditions: Array<ReturnType<typeof eq>> = [];
  private orderByClause: Array<{ column: string; direction: 'asc' | 'desc' }> = [];
  private limitValue?: number;
  private offsetValue?: number;
  private selectColumns: string[] = [];

  constructor(
    private modelClass: typeof Model,
    private options: QueryBuilderOptions
  ) {}

  /**
   * Add a where condition
   */
  where(column: keyof TAttributes | string, operatorOrValue?: WhereOperator | unknown, value?: unknown): this {
    const col = this.getColumn(column as string);
    if (!col) return this;

    // Handle different argument patterns
    if (value === undefined && operatorOrValue !== undefined) {
      // where('column', 'value') - equals
      this.conditions.push(eq(col, operatorOrValue));
    } else if (operatorOrValue && value !== undefined) {
      // where('column', 'operator', 'value')
      const op = operatorOrValue as WhereOperator;
      switch (op) {
        case '=':
          this.conditions.push(eq(col, value));
          break;
        case '!=':
          this.conditions.push(ne(col, value));
          break;
        case '<':
          this.conditions.push(lt(col, value));
          break;
        case '<=':
          this.conditions.push(lte(col, value));
          break;
        case '>':
          this.conditions.push(gt(col, value));
          break;
        case '>=':
          this.conditions.push(gte(col, value));
          break;
        case 'like':
          this.conditions.push(like(col, value as string));
          break;
        case 'in':
          this.conditions.push(inArray(col, value as unknown[]));
          break;
        case 'is null':
          this.conditions.push(isNull(col));
          break;
        case 'is not null':
          this.conditions.push(isNotNull(col));
          break;
      }
    }
    return this;
  }

  /**
   * Add a where equals condition
   */
  whereEquals(column: keyof TAttributes | string, value: unknown): this {
    return this.where(column, '=', value);
  }

  /**
   * Add a where not equals condition
   */
  whereNot(column: keyof TAttributes | string, value: unknown): this {
    return this.where(column, '!=', value);
  }

  /**
   * Add a where null condition
   */
  whereNull(column: keyof TAttributes | string): this {
    const col = this.getColumn(column as string);
    if (col) this.conditions.push(isNull(col));
    return this;
  }

  /**
   * Add a where not null condition
   */
  whereNotNull(column: keyof TAttributes | string): this {
    const col = this.getColumn(column as string);
    if (col) this.conditions.push(isNotNull(col));
    return this;
  }

  /**
   * Add a where in condition
   */
  whereIn(column: keyof TAttributes | string, values: unknown[]): this {
    const col = this.getColumn(column as string);
    if (col) this.conditions.push(inArray(col, values));
    return this;
  }

  /**
   * Add a where like condition
   */
  whereLike(column: keyof TAttributes | string, pattern: string): this {
    return this.where(column, 'like', pattern);
  }

  /**
   * Order by a column
   */
  orderBy(column: keyof TAttributes | string, direction: 'asc' | 'desc' = 'asc'): this {
    this.orderByClause.push({ column: column as string, direction });
    return this;
  }

  /**
   * Order by descending
   */
  orderByDesc(column: keyof TAttributes | string): this {
    return this.orderBy(column, 'desc');
  }

  /**
   * Limit results
   */
  limit(count: number): this {
    this.limitValue = count;
    return this;
  }

  /**
   * Alias for limit
   */
  take(count: number): this {
    return this.limit(count);
  }

  /**
   * Offset results
   */
  offset(count: number): this {
    this.offsetValue = count;
    return this;
  }

  /**
   * Alias for offset
   */
  skip(count: number): this {
    return this.offset(count);
  }

  /**
   * Select specific columns
   */
  select(...columns: (keyof TAttributes | string)[]): this {
    this.selectColumns = columns as string[];
    return this;
  }

  /**
   * Get the column reference from the table
   */
  private getColumn(name: string): SQLiteColumn | null {
    const table = this.options.table as unknown as Record<string, SQLiteColumn>;
    return table[name] || null;
  }

  /**
   * Build and execute the query, return all results
   */
  async get(): Promise<Model<TAttributes>[]> {
    let query = db().select().from(this.options.table);

    // Apply conditions
    if (this.conditions.length > 0) {
      query = query.where(and(...this.conditions)) as typeof query;
    }

    // Apply limit and offset
    if (this.limitValue !== undefined) {
      query = query.limit(this.limitValue) as typeof query;
    }
    if (this.offsetValue !== undefined) {
      query = query.offset(this.offsetValue) as typeof query;
    }

    const results = await query.all();

    return results.map((row) => {
      const instance = new (this.modelClass as unknown as new (attrs: Partial<TAttributes>) => Model<TAttributes>)(
        row as Partial<TAttributes>
      );
      instance.exists = true;
      instance.syncOriginal();
      return instance;
    });
  }

  /**
   * Get the first result
   */
  async first(): Promise<Model<TAttributes> | null> {
    this.limitValue = 1;
    const results = await this.get();
    return results[0] || null;
  }

  /**
   * Get the first result or throw
   */
  async firstOrFail(): Promise<Model<TAttributes>> {
    const result = await this.first();
    if (!result) {
      throw new Error('No record found');
    }
    return result;
  }

  /**
   * Get count of results
   */
  async count(): Promise<number> {
    let query = db()
      .select({ count: sql<number>`count(*)` })
      .from(this.options.table);

    if (this.conditions.length > 0) {
      query = query.where(and(...this.conditions)) as typeof query;
    }

    const result = await query.get();
    return result?.count || 0;
  }

  /**
   * Check if any records exist
   */
  async exists(): Promise<boolean> {
    const count = await this.count();
    return count > 0;
  }

  /**
   * Delete matching records
   */
  async delete(): Promise<number> {
    let query = dbWrite().delete(this.options.table);

    if (this.conditions.length > 0) {
      query = query.where(and(...this.conditions)) as typeof query;
    }

    await query;
    return 1; // SQLite doesn't return affected rows easily
  }

  /**
   * Update matching records
   */
  async update(data: Partial<TAttributes>): Promise<number> {
    let query = dbWrite().update(this.options.table).set(data as Record<string, unknown>);

    if (this.conditions.length > 0) {
      query = query.where(and(...this.conditions)) as typeof query;
    }

    await query;
    return 1;
  }
}

export abstract class Model<TAttributes extends Record<string, unknown> = Record<string, unknown>> {
  /** The table name associated with the model */
  protected abstract table: string;

  /** The Drizzle schema table reference */
  protected abstract schemaTable: SQLiteTable;

  /** The primary key column name */
  protected primaryKey: string = 'id';

  /** Indicates if the model's ID is auto-incrementing */
  protected incrementing: boolean = true;

  /** The attributes that are mass assignable */
  protected fillable: (keyof TAttributes)[] = [];

  /** The attributes that aren't mass assignable */
  protected guarded: (keyof TAttributes)[] = ['id'];

  /** The attributes excluded from JSON serialization */
  protected hidden: (keyof TAttributes)[] = [];

  /** The attributes that should be visible in JSON serialization */
  protected visible: (keyof TAttributes)[] = [];

  /** The attribute type casting configuration */
  protected casts: Partial<Record<keyof TAttributes, string>> = {};

  /** The model's attributes */
  protected attributes: Partial<TAttributes> = {};

  /** The model's original attributes (before modifications) */
  protected original: Partial<TAttributes> = {};

  /** Whether the model exists in the database */
  public exists: boolean = false;

  /** Indicates if the model was recently created */
  public wasRecentlyCreated: boolean = false;

  /** Timestamp column names */
  protected static CREATED_AT = 'created_at';
  protected static UPDATED_AT = 'updated_at';

  /** Whether to use timestamps */
  protected timestamps: boolean = true;

  /** Event callbacks */
  private static eventCallbacks: Map<string, EventCallback<Model>[]> = new Map();

  /** Loaded relationships */
  protected relations: Map<string, unknown> = new Map();

  constructor(attributes: Partial<TAttributes> = {}) {
    this.fill(attributes);
  }

  // ==================== STATIC QUERY METHODS ====================

  /**
   * Create a new query builder instance
   */
  public static query<T extends Model<R>, R extends Record<string, unknown> = Record<string, unknown>>(
    this: new (attrs?: Partial<R>) => T
  ): QueryBuilder<R> {
    const instance = new this();
    return new QueryBuilder<R>(Model, {
      table: instance.schemaTable,
      primaryKey: instance.primaryKey,
    });
  }

  /**
   * Find a model by its primary key
   */
  public static async find<T extends Model<R>, R extends Record<string, unknown>>(
    this: new (attrs?: Partial<R>) => T,
    id: unknown
  ): Promise<T | null> {
    const instance = new this();
    const table = instance.schemaTable as unknown as Record<string, SQLiteColumn>;
    const pkColumn = table[instance.primaryKey];

    if (!pkColumn) return null;

    const result = await db()
      .select()
      .from(instance.schemaTable)
      .where(eq(pkColumn, id))
      .get();

    if (!result) return null;

    const model = new this(result as Partial<R>);
    model.exists = true;
    model.syncOriginal();
    return model;
  }

  /**
   * Find a model by primary key or throw
   */
  public static async findOrFail<T extends Model<R>, R extends Record<string, unknown>>(
    this: new (attrs?: Partial<R>) => T,
    id: unknown
  ): Promise<T> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await (this as any).find(id);
    if (!result) {
      throw new Error(`Model not found with id: ${id}`);
    }
    return result as T;
  }

  /**
   * Get all models
   */
  public static async all<T extends Model<R>, R extends Record<string, unknown>>(
    this: new (attrs?: Partial<R>) => T
  ): Promise<T[]> {
    const instance = new this();
    const results = await db().select().from(instance.schemaTable).all();

    return results.map((row) => {
      const model = new this(row as Partial<R>);
      model.exists = true;
      model.syncOriginal();
      return model;
    });
  }

  /**
   * Create a new model and persist it
   */
  public static async create<T extends Model<R>, R extends Record<string, unknown>>(
    this: new (attrs?: Partial<R>) => T,
    attributes: Partial<R>
  ): Promise<T> {
    const model = new this(attributes);
    await model.save();
    return model;
  }

  /**
   * Find or create a model
   */
  public static async firstOrCreate<T extends Model<R>, R extends Record<string, unknown>>(
    this: new (attrs?: Partial<R>) => T,
    search: Partial<R>,
    additional: Partial<R> = {}
  ): Promise<T> {
    const instance = new this();
    const table = instance.schemaTable as unknown as Record<string, SQLiteColumn>;

    const conditions = Object.entries(search).map(([key, value]) => {
      const col = table[key];
      return col ? eq(col, value) : null;
    }).filter(Boolean);

    if (conditions.length > 0) {
      const existing = await db()
        .select()
        .from(instance.schemaTable)
        .where(and(...(conditions as ReturnType<typeof eq>[])))
        .get();

      if (existing) {
        const model = new this(existing as Partial<R>);
        model.exists = true;
        model.syncOriginal();
        return model;
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this as any).create({ ...search, ...additional });
  }

  /**
   * Update or create a model
   */
  public static async updateOrCreate<T extends Model<R>, R extends Record<string, unknown>>(
    this: new (attrs?: Partial<R>) => T,
    search: Partial<R>,
    update: Partial<R>
  ): Promise<T> {
    const instance = new this();
    const table = instance.schemaTable as unknown as Record<string, SQLiteColumn>;

    const conditions = Object.entries(search).map(([key, value]) => {
      const col = table[key];
      return col ? eq(col, value) : null;
    }).filter(Boolean);

    if (conditions.length > 0) {
      const existing = await db()
        .select()
        .from(instance.schemaTable)
        .where(and(...(conditions as ReturnType<typeof eq>[])))
        .get();

      if (existing) {
        const model = new this(existing as Partial<R>);
        model.exists = true;
        model.fill(update);
        await model.save();
        return model;
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this as any).create({ ...search, ...update });
  }

  /**
   * Destroy models by primary key(s)
   */
  public static async destroy<T extends Model<R>, R extends Record<string, unknown>>(
    this: new (attrs?: Partial<R>) => T,
    ids: unknown | unknown[]
  ): Promise<number> {
    const instance = new this();
    const table = instance.schemaTable as unknown as Record<string, SQLiteColumn>;
    const pkColumn = table[instance.primaryKey];

    if (!pkColumn) return 0;

    const idsArray = Array.isArray(ids) ? ids : [ids];

    await dbWrite()
      .delete(instance.schemaTable)
      .where(inArray(pkColumn, idsArray));

    return idsArray.length;
  }

  // ==================== MODEL EVENTS ====================

  protected static booting(): void {}
  protected static booted(): void {}

  public static creating<T extends Model>(callback: EventCallback<T>): void {
    this.registerEvent('creating', callback as EventCallback<Model>);
  }

  public static created<T extends Model>(callback: EventCallback<T>): void {
    this.registerEvent('created', callback as EventCallback<Model>);
  }

  public static updating<T extends Model>(callback: EventCallback<T>): void {
    this.registerEvent('updating', callback as EventCallback<Model>);
  }

  public static updated<T extends Model>(callback: EventCallback<T>): void {
    this.registerEvent('updated', callback as EventCallback<Model>);
  }

  public static deleting<T extends Model>(callback: EventCallback<T>): void {
    this.registerEvent('deleting', callback as EventCallback<Model>);
  }

  public static deleted<T extends Model>(callback: EventCallback<T>): void {
    this.registerEvent('deleted', callback as EventCallback<Model>);
  }

  private static registerEvent(event: string, callback: EventCallback<Model>): void {
    const key = `${this.name}.${event}`;
    const callbacks = this.eventCallbacks.get(key) || [];
    callbacks.push(callback);
    this.eventCallbacks.set(key, callbacks);
  }

  protected async fireEvent(event: string): Promise<void> {
    const key = `${this.constructor.name}.${event}`;
    const callbacks = Model.eventCallbacks.get(key) || [];
    for (const callback of callbacks) {
      await callback(this as unknown as Model);
    }
  }

  // ==================== ATTRIBUTE MANAGEMENT ====================

  public fill(attributes: Partial<TAttributes>): this {
    for (const [key, value] of Object.entries(attributes)) {
      if (this.isFillable(key as keyof TAttributes)) {
        this.setAttribute(key as keyof TAttributes, value as TAttributes[keyof TAttributes]);
      }
    }
    return this;
  }

  protected isFillable(key: keyof TAttributes): boolean {
    if (this.guarded.includes(key)) {
      return false;
    }
    if (this.fillable.length > 0) {
      return this.fillable.includes(key);
    }
    return true;
  }

  public setAttribute<K extends keyof TAttributes>(key: K, value: TAttributes[K]): this {
    this.attributes[key] = value;
    return this;
  }

  public getAttribute<K extends keyof TAttributes>(key: K): TAttributes[K] | undefined {
    const value = this.attributes[key];
    return this.castAttribute(key, value);
  }

  protected castAttribute<K extends keyof TAttributes>(key: K, value: unknown): TAttributes[K] | undefined {
    if (value === undefined || value === null) {
      return value as TAttributes[K];
    }

    const castType = this.casts[key];
    if (!castType) {
      return value as TAttributes[K];
    }

    switch (castType) {
      case 'int':
      case 'integer':
        return parseInt(String(value), 10) as TAttributes[K];
      case 'float':
      case 'double':
      case 'decimal':
        return parseFloat(String(value)) as TAttributes[K];
      case 'string':
        return String(value) as TAttributes[K];
      case 'bool':
      case 'boolean':
        return Boolean(value) as TAttributes[K];
      case 'json':
      case 'array':
      case 'object':
        if (typeof value === 'string') {
          try {
            return JSON.parse(value) as TAttributes[K];
          } catch {
            return value as TAttributes[K];
          }
        }
        return value as TAttributes[K];
      case 'datetime':
      case 'date':
        return (value instanceof Date ? value : new Date(String(value))) as TAttributes[K];
      default:
        return value as TAttributes[K];
    }
  }

  public getKey(): unknown {
    return this.getAttribute(this.primaryKey as keyof TAttributes);
  }

  public getKeyName(): string {
    return this.primaryKey;
  }

  public getTable(): string {
    return this.table;
  }

  public isDirty(key?: keyof TAttributes): boolean {
    if (key) {
      return this.attributes[key] !== this.original[key];
    }
    return Object.keys(this.attributes).some(
      (k) => this.attributes[k as keyof TAttributes] !== this.original[k as keyof TAttributes]
    );
  }

  public getDirty(): Partial<TAttributes> {
    const dirty: Partial<TAttributes> = {};
    for (const key of Object.keys(this.attributes)) {
      if (this.attributes[key as keyof TAttributes] !== this.original[key as keyof TAttributes]) {
        dirty[key as keyof TAttributes] = this.attributes[key as keyof TAttributes];
      }
    }
    return dirty;
  }

  public syncOriginal(): this {
    this.original = { ...this.attributes };
    return this;
  }

  // ==================== SERIALIZATION ====================

  public toJSON(): Partial<TAttributes> {
    const data = { ...this.attributes };

    for (const key of this.hidden) {
      delete data[key];
    }

    if (this.visible.length > 0) {
      const visibleData: Partial<TAttributes> = {};
      for (const key of this.visible) {
        if (data[key] !== undefined) {
          visibleData[key] = data[key];
        }
      }
      return visibleData;
    }

    return data;
  }

  public toArray(): Partial<TAttributes> {
    return { ...this.attributes };
  }

  // ==================== LIFECYCLE METHODS ====================

  public async save(): Promise<boolean> {
    if (this.exists) {
      return this.performUpdate();
    }
    return this.performInsert();
  }

  protected async performInsert(): Promise<boolean> {
    await this.fireEvent('creating');

    if (this.timestamps) {
      const now = new Date();
      this.setAttribute(Model.CREATED_AT as keyof TAttributes, now as TAttributes[keyof TAttributes]);
      this.setAttribute(Model.UPDATED_AT as keyof TAttributes, now as TAttributes[keyof TAttributes]);
    }

    const insertData = { ...this.attributes };

    await dbWrite().insert(this.schemaTable).values(insertData as Record<string, unknown>);

    this.exists = true;
    this.wasRecentlyCreated = true;
    this.syncOriginal();

    await this.fireEvent('created');
    return true;
  }

  protected async performUpdate(): Promise<boolean> {
    if (!this.isDirty()) {
      return true;
    }

    await this.fireEvent('updating');

    if (this.timestamps) {
      this.setAttribute(Model.UPDATED_AT as keyof TAttributes, new Date() as TAttributes[keyof TAttributes]);
    }

    const dirty = this.getDirty();
    const table = this.schemaTable as unknown as Record<string, SQLiteColumn>;
    const pkColumn = table[this.primaryKey];

    if (pkColumn) {
      await dbWrite()
        .update(this.schemaTable)
        .set(dirty as Record<string, unknown>)
        .where(eq(pkColumn, this.getKey()));
    }

    this.syncOriginal();

    await this.fireEvent('updated');
    return true;
  }

  public async delete(): Promise<boolean> {
    await this.fireEvent('deleting');

    const table = this.schemaTable as unknown as Record<string, SQLiteColumn>;
    const pkColumn = table[this.primaryKey];

    if (pkColumn) {
      await dbWrite()
        .delete(this.schemaTable)
        .where(eq(pkColumn, this.getKey()));
    }

    this.exists = false;

    await this.fireEvent('deleted');
    return true;
  }

  public async refresh(): Promise<this> {
    const table = this.schemaTable as unknown as Record<string, SQLiteColumn>;
    const pkColumn = table[this.primaryKey];

    if (pkColumn) {
      const fresh = await db()
        .select()
        .from(this.schemaTable)
        .where(eq(pkColumn, this.getKey()))
        .get();

      if (fresh) {
        this.attributes = fresh as Partial<TAttributes>;
        this.syncOriginal();
      }
    }

    return this;
  }

  // ==================== RELATIONSHIPS ====================

  /**
   * Define a one-to-one relationship
   */
  protected async hasOne<T extends Model<R>, R extends Record<string, unknown>>(
    related: new (attrs?: Partial<R>) => T,
    foreignKey?: string,
    localKey?: string
  ): Promise<T | null> {
    const fk = foreignKey || `${this.constructor.name.toLowerCase()}_id`;
    const lk = localKey || this.primaryKey;
    const localValue = this.getAttribute(lk as keyof TAttributes);

    const relatedInstance = new related();
    const table = relatedInstance.schemaTable as unknown as Record<string, SQLiteColumn>;
    const fkColumn = table[fk];

    if (!fkColumn || localValue === undefined) return null;

    const result = await db()
      .select()
      .from(relatedInstance.schemaTable)
      .where(eq(fkColumn, localValue))
      .get();

    if (!result) return null;

    const model = new related(result as Partial<R>);
    model.exists = true;
    model.syncOriginal();
    return model;
  }

  /**
   * Define a one-to-many relationship
   */
  protected async hasMany<T extends Model<R>, R extends Record<string, unknown>>(
    related: new (attrs?: Partial<R>) => T,
    foreignKey?: string,
    localKey?: string
  ): Promise<T[]> {
    const fk = foreignKey || `${this.constructor.name.toLowerCase()}_id`;
    const lk = localKey || this.primaryKey;
    const localValue = this.getAttribute(lk as keyof TAttributes);

    const relatedInstance = new related();
    const table = relatedInstance.schemaTable as unknown as Record<string, SQLiteColumn>;
    const fkColumn = table[fk];

    if (!fkColumn || localValue === undefined) return [];

    const results = await db()
      .select()
      .from(relatedInstance.schemaTable)
      .where(eq(fkColumn, localValue))
      .all();

    return results.map((row) => {
      const model = new related(row as Partial<R>);
      model.exists = true;
      model.syncOriginal();
      return model;
    });
  }

  /**
   * Define an inverse one-to-one or one-to-many relationship
   */
  protected async belongsTo<T extends Model<R>, R extends Record<string, unknown>>(
    related: new (attrs?: Partial<R>) => T,
    foreignKey?: string,
    ownerKey?: string
  ): Promise<T | null> {
    const relatedInstance = new related();
    const fk = foreignKey || `${relatedInstance.constructor.name.toLowerCase()}_id`;
    const ok = ownerKey || relatedInstance.primaryKey;
    const foreignValue = this.getAttribute(fk as keyof TAttributes);

    const table = relatedInstance.schemaTable as unknown as Record<string, SQLiteColumn>;
    const okColumn = table[ok];

    if (!okColumn || foreignValue === undefined) return null;

    const result = await db()
      .select()
      .from(relatedInstance.schemaTable)
      .where(eq(okColumn, foreignValue))
      .get();

    if (!result) return null;

    const model = new related(result as Partial<R>);
    model.exists = true;
    model.syncOriginal();
    return model;
  }

  /**
   * Define a many-to-many relationship
   */
  protected async belongsToMany<T extends Model<R>, R extends Record<string, unknown>>(
    related: new (attrs?: Partial<R>) => T,
    pivotTable?: string,
    foreignPivotKey?: string,
    relatedPivotKey?: string
  ): Promise<T[]> {
    const relatedInstance = new related();
    const pt = pivotTable || [this.constructor.name, relatedInstance.constructor.name].sort().join('_').toLowerCase();
    const fpk = foreignPivotKey || `${this.constructor.name.toLowerCase()}_id`;
    const rpk = relatedPivotKey || `${relatedInstance.constructor.name.toLowerCase()}_id`;

    const localValue = this.getKey();
    if (localValue === undefined) return [];

    // Get pivot table from schema
    const pivotSchema = (schema as Record<string, SQLiteTable>)[pt];
    if (!pivotSchema) return [];

    const pivotTableCols = pivotSchema as unknown as Record<string, SQLiteColumn>;
    const fpkColumn = pivotTableCols[fpk];
    const rpkColumn = pivotTableCols[rpk];

    if (!fpkColumn || !rpkColumn) return [];

    // Get related IDs from pivot
    const pivotResults = await db()
      .select()
      .from(pivotSchema)
      .where(eq(fpkColumn, localValue))
      .all();

    const relatedIds = pivotResults.map((row) => (row as Record<string, unknown>)[rpk]);

    if (relatedIds.length === 0) return [];

    // Get related models
    const relatedTable = relatedInstance.schemaTable as unknown as Record<string, SQLiteColumn>;
    const relatedPkColumn = relatedTable[relatedInstance.primaryKey];

    if (!relatedPkColumn) return [];

    const results = await db()
      .select()
      .from(relatedInstance.schemaTable)
      .where(inArray(relatedPkColumn, relatedIds))
      .all();

    return results.map((row) => {
      const model = new related(row as Partial<R>);
      model.exists = true;
      model.syncOriginal();
      return model;
    });
  }

  /**
   * Load a relationship
   */
  public async load<K extends string>(relation: K): Promise<this> {
    const method = (this as unknown as Record<string, () => Promise<unknown>>)[relation];
    if (typeof method === 'function') {
      const result = await method.call(this);
      this.relations.set(relation, result);
    }
    return this;
  }

  /**
   * Get a loaded relationship
   */
  public getRelation<T>(name: string): T | undefined {
    return this.relations.get(name) as T | undefined;
  }
}

export default Model;
