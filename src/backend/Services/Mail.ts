/**
 * Catalyst Mail Service
 *
 * Singleton service for sending emails through various drivers.
 * Supports SMTP, Mailgun, log, and array drivers.
 *
 * @example
 * ```ts
 * import { Mail } from '@/backend/Services/Mail';
 * import { WelcomeEmail } from '@/backend/Mail/WelcomeEmail';
 *
 * // Send immediately
 * await Mail.send(new WelcomeEmail(user));
 *
 * // Send using specific mailer
 * await Mail.mailer('smtp').send(new WelcomeEmail(user));
 *
 * // Queue for later
 * await Mail.queue(new WelcomeEmail(user));
 *
 * // Send raw email
 * await Mail.raw({
 *   to: 'user@example.com',
 *   subject: 'Hello',
 *   html: '<h1>Hello World</h1>',
 * });
 * ```
 */

import mailConfig, { MailDriver as MailDriverType } from '../../../config/mail';
import { Mailable, MailAddress } from '../Mail/Mailable';
import { MailDriver, MailDriverInterface, SendResult } from '../Mail/Drivers/MailDriver';
import { SmtpDriver } from '../Mail/Drivers/SmtpDriver';
import { LogDriver } from '../Mail/Drivers/LogDriver';
import { ArrayDriver } from '../Mail/Drivers/ArrayDriver';
import { SesDriver } from '../Mail/Drivers/SesDriver';
import { Log } from './Logger';

export interface RawMailOptions {
  from?: string | MailAddress;
  to: string | string[] | MailAddress | MailAddress[];
  cc?: string | string[] | MailAddress | MailAddress[];
  bcc?: string | string[] | MailAddress | MailAddress[];
  replyTo?: string | MailAddress;
  subject: string;
  html?: string;
  text?: string;
}

/**
 * Simple mailable for raw emails
 */
class RawMailable extends Mailable {
  constructor(private options: RawMailOptions) {
    super();
  }

  build(): this {
    // Set from
    if (this.options.from) {
      if (typeof this.options.from === 'string') {
        this.from(this.options.from);
      } else {
        this.from(this.options.from.address, this.options.from.name);
      }
    }

    // Set to
    this.to(this.options.to as string);

    // Set cc
    if (this.options.cc) {
      this.cc(this.options.cc as string);
    }

    // Set bcc
    if (this.options.bcc) {
      this.bcc(this.options.bcc as string);
    }

    // Set reply-to
    if (this.options.replyTo) {
      if (typeof this.options.replyTo === 'string') {
        this.replyTo(this.options.replyTo);
      } else {
        this.replyTo(this.options.replyTo.address, this.options.replyTo.name);
      }
    }

    // Set subject and content
    this.subject(this.options.subject);

    if (this.options.html) {
      this.html(this.options.html);
    }

    if (this.options.text) {
      this.text(this.options.text);
    }

    return this;
  }
}

class MailService {
  private static instance: MailService | null = null;
  private drivers: Map<string, MailDriverInterface> = new Map();
  private defaultMailer: string;
  private fakeMode: boolean = false;

  private constructor() {
    this.defaultMailer = mailConfig.default;
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): MailService {
    if (!MailService.instance) {
      MailService.instance = new MailService();
    }
    return MailService.instance;
  }

  /**
   * Reset the singleton instance (for testing)
   */
  public static reset(): void {
    MailService.instance = null;
  }

  /**
   * Get a mail driver instance
   */
  private getDriver(name?: string): MailDriverInterface {
    const driverName = name || this.defaultMailer;

    // Return fake driver if in fake mode
    if (this.fakeMode) {
      return this.createDriver('array');
    }

    if (!this.drivers.has(driverName)) {
      this.drivers.set(driverName, this.createDriver(driverName));
    }

    return this.drivers.get(driverName)!;
  }

  /**
   * Create a driver instance
   */
  private createDriver(name: string): MailDriverInterface {
    const config = mailConfig.mailers[name];

    if (!config) {
      throw new Error(`Mail driver [${name}] not configured.`);
    }

    switch (config.driver as MailDriverType) {
      case 'smtp':
        return new SmtpDriver(config);
      case 'log':
        return new LogDriver();
      case 'array':
        return new ArrayDriver();
      case 'mailgun':
        // TODO: Implement Mailgun driver
        Log.warning('Mailgun driver not yet implemented, falling back to log driver');
        return new LogDriver();
      case 'ses':
        return new SesDriver({
          region: config.region,
        });
      default:
        throw new Error(`Unsupported mail driver: ${config.driver}`);
    }
  }

  /**
   * Send a mailable
   */
  public async send(mailable: Mailable): Promise<SendResult> {
    const driver = this.getDriver();

    try {
      const result = await driver.send(mailable);

      if (!result.success) {
        Log.error('Failed to send email', {
          driver: driver.getName(),
          error: result.error?.message,
        });
      } else {
        Log.info('Email sent successfully', {
          driver: driver.getName(),
          messageId: result.messageId,
        });
      }

      return result;
    } catch (error) {
      Log.error('Exception while sending email', {
        driver: driver.getName(),
      }, error instanceof Error ? error : new Error(String(error)));

      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  /**
   * Send a raw email without creating a Mailable class
   */
  public async raw(options: RawMailOptions): Promise<SendResult> {
    return this.send(new RawMailable(options));
  }

  /**
   * Use a specific mailer
   */
  public mailer(name: string): MailerInstance {
    return new MailerInstance(this.getDriver(name));
  }

  /**
   * Queue a mailable for later sending
   */
  public async queue(mailable: Mailable): Promise<void> {
    // TODO: Integrate with Job queue system
    // For now, send immediately with a warning
    Log.warning('Mail queue not yet integrated with job system, sending immediately');
    await this.send(mailable);
  }

  /**
   * Enable fake mode for testing (uses ArrayDriver)
   */
  public fake(): void {
    this.fakeMode = true;
    ArrayDriver.flush();
  }

  /**
   * Disable fake mode
   */
  public unfake(): void {
    this.fakeMode = false;
  }

  /**
   * Check if in fake mode
   */
  public isFake(): boolean {
    return this.fakeMode;
  }

  /**
   * Get sent emails (only in fake mode)
   */
  public sent(): ReturnType<typeof ArrayDriver.getSent> {
    if (!this.fakeMode) {
      throw new Error('Mail.sent() is only available in fake mode. Call Mail.fake() first.');
    }
    return ArrayDriver.getSent();
  }

  /**
   * Assert sent count (only in fake mode)
   */
  public assertSentCount(count: number): boolean {
    if (!this.fakeMode) {
      throw new Error('Assertions are only available in fake mode. Call Mail.fake() first.');
    }
    return ArrayDriver.assertSentCount(count);
  }

  /**
   * Assert sent to address (only in fake mode)
   */
  public assertSentTo(email: string): boolean {
    if (!this.fakeMode) {
      throw new Error('Assertions are only available in fake mode. Call Mail.fake() first.');
    }
    return ArrayDriver.assertSentTo(email);
  }

  /**
   * Assert nothing sent (only in fake mode)
   */
  public assertNothingSent(): boolean {
    if (!this.fakeMode) {
      throw new Error('Assertions are only available in fake mode. Call Mail.fake() first.');
    }
    return ArrayDriver.assertNothingSent();
  }
}

/**
 * Mailer instance for fluent API with specific driver
 */
class MailerInstance {
  constructor(private driver: MailDriverInterface) {}

  async send(mailable: Mailable): Promise<SendResult> {
    return this.driver.send(mailable);
  }
}

// Export singleton accessor
export const Mail = MailService.getInstance();

// Export for direct import
export { Mailable } from '../Mail/Mailable';
export { ArrayDriver } from '../Mail/Drivers/ArrayDriver';

export default MailService;
