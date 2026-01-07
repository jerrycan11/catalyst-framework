/**
 * Catalyst Mailable Base Class
 *
 * Base class for building mail messages. Extend this class to create
 * custom mailables with templates and data.
 *
 * @example
 * ```ts
 * class WelcomeEmail extends Mailable {
 *   constructor(private user: User) {
 *     super();
 *   }
 *
 *   build(): this {
 *     return this
 *       .to(this.user.email)
 *       .subject('Welcome to Our App!')
 *       .html(`<h1>Welcome, ${this.user.name}!</h1>`);
 *   }
 * }
 *
 * // Send the email
 * await Mail.send(new WelcomeEmail(user));
 * ```
 */

export interface MailAddress {
  address: string;
  name?: string;
}

export interface MailAttachment {
  filename: string;
  content: string | Buffer;
  contentType?: string;
  encoding?: 'base64' | 'utf-8';
}

export interface MailEnvelope {
  from?: MailAddress;
  to: MailAddress[];
  cc: MailAddress[];
  bcc: MailAddress[];
  replyTo?: MailAddress;
  subject: string;
}

export interface MailContent {
  html?: string;
  text?: string;
}

export abstract class Mailable {
  protected envelope: MailEnvelope = {
    to: [],
    cc: [],
    bcc: [],
    subject: '',
  };

  protected content: MailContent = {};
  protected attachments: MailAttachment[] = [];
  protected metadata: Record<string, unknown> = {};

  /** Queue name for queued mail */
  public queue?: string;
  /** Delay before sending (in seconds) */
  public delay?: number;

  /**
   * Build the message - must be implemented by subclass
   */
  abstract build(): this;

  /**
   * Set the sender address
   */
  public from(address: string, name?: string): this {
    this.envelope.from = { address, name };
    return this;
  }

  /**
   * Add recipient(s)
   */
  public to(address: string | string[] | MailAddress | MailAddress[], name?: string): this {
    this.addAddresses('to', address, name);
    return this;
  }

  /**
   * Add CC recipient(s)
   */
  public cc(address: string | string[] | MailAddress | MailAddress[], name?: string): this {
    this.addAddresses('cc', address, name);
    return this;
  }

  /**
   * Add BCC recipient(s)
   */
  public bcc(address: string | string[] | MailAddress | MailAddress[], name?: string): this {
    this.addAddresses('bcc', address, name);
    return this;
  }

  /**
   * Set reply-to address
   */
  public replyTo(address: string, name?: string): this {
    this.envelope.replyTo = { address, name };
    return this;
  }

  /**
   * Set the subject
   */
  public subject(subject: string): this {
    this.envelope.subject = subject;
    return this;
  }

  /**
   * Set HTML content
   */
  public html(content: string): this {
    this.content.html = content;
    return this;
  }

  /**
   * Set plain text content
   */
  public text(content: string): this {
    this.content.text = content;
    return this;
  }

  /**
   * Add an attachment
   */
  public attach(filename: string, content: string | Buffer, contentType?: string): this {
    this.attachments.push({ filename, content, contentType });
    return this;
  }

  /**
   * Add metadata (for tracking, etc.)
   */
  public withMetadata(key: string, value: unknown): this {
    this.metadata[key] = value;
    return this;
  }

  /**
   * Set queue for deferred sending
   */
  public onQueue(queue: string): this {
    this.queue = queue;
    return this;
  }

  /**
   * Set delay before sending
   */
  public later(seconds: number): this {
    this.delay = seconds;
    return this;
  }

  /**
   * Helper to add addresses to a field
   */
  private addAddresses(
    field: 'to' | 'cc' | 'bcc',
    address: string | string[] | MailAddress | MailAddress[],
    name?: string
  ): void {
    if (typeof address === 'string') {
      this.envelope[field].push({ address, name });
    } else if (Array.isArray(address)) {
      for (const addr of address) {
        if (typeof addr === 'string') {
          this.envelope[field].push({ address: addr });
        } else {
          this.envelope[field].push(addr);
        }
      }
    } else {
      this.envelope[field].push(address);
    }
  }

  /**
   * Get the envelope
   */
  public getEnvelope(): MailEnvelope {
    return this.envelope;
  }

  /**
   * Get the content
   */
  public getContent(): MailContent {
    return this.content;
  }

  /**
   * Get attachments
   */
  public getAttachments(): MailAttachment[] {
    return this.attachments;
  }

  /**
   * Get metadata
   */
  public getMetadata(): Record<string, unknown> {
    return this.metadata;
  }
}

export default Mailable;
