/**
 * Array Mail Driver
 *
 * Stores sent emails in memory for testing purposes.
 * Allows assertions on sent emails in tests.
 */

import { MailDriver, SendResult } from './MailDriver';
import { Mailable, MailEnvelope, MailContent, MailAttachment } from '../Mailable';
import { nanoid } from 'nanoid';

export interface SentMail {
  messageId: string;
  envelope: MailEnvelope;
  content: MailContent;
  attachments: MailAttachment[];
  metadata: Record<string, unknown>;
  sentAt: Date;
}

export class ArrayDriver extends MailDriver {
  private static sent: SentMail[] = [];

  getName(): string {
    return 'array';
  }

  async send(mailable: Mailable): Promise<SendResult> {
    // Build the mailable
    mailable.build();

    const messageId = `array-${nanoid()}`;

    const sentMail: SentMail = {
      messageId,
      envelope: mailable.getEnvelope(),
      content: mailable.getContent(),
      attachments: mailable.getAttachments(),
      metadata: mailable.getMetadata(),
      sentAt: new Date(),
    };

    ArrayDriver.sent.push(sentMail);

    return {
      success: true,
      messageId,
    };
  }

  /**
   * Get all sent emails
   */
  static getSent(): SentMail[] {
    return [...ArrayDriver.sent];
  }

  /**
   * Get sent emails count
   */
  static count(): number {
    return ArrayDriver.sent.length;
  }

  /**
   * Check if any email was sent to a specific address
   */
  static hasSentTo(email: string): boolean {
    return ArrayDriver.sent.some((mail) =>
      mail.envelope.to.some((addr) => addr.address === email)
    );
  }

  /**
   * Check if any email with specific subject was sent
   */
  static hasSentWithSubject(subject: string): boolean {
    return ArrayDriver.sent.some((mail) => mail.envelope.subject === subject);
  }

  /**
   * Get emails sent to a specific address
   */
  static getSentTo(email: string): SentMail[] {
    return ArrayDriver.sent.filter((mail) =>
      mail.envelope.to.some((addr) => addr.address === email)
    );
  }

  /**
   * Clear all sent emails
   */
  static flush(): void {
    ArrayDriver.sent = [];
  }

  /**
   * Assert that a certain number of emails were sent
   */
  static assertSentCount(count: number): boolean {
    if (ArrayDriver.sent.length !== count) {
      throw new Error(
        `Expected ${count} emails to be sent, but ${ArrayDriver.sent.length} were sent.`
      );
    }
    return true;
  }

  /**
   * Assert that an email was sent to a specific address
   */
  static assertSentTo(email: string): boolean {
    if (!ArrayDriver.hasSentTo(email)) {
      throw new Error(`Expected an email to be sent to ${email}, but none was found.`);
    }
    return true;
  }

  /**
   * Assert that no emails were sent
   */
  static assertNothingSent(): boolean {
    if (ArrayDriver.sent.length > 0) {
      throw new Error(
        `Expected no emails to be sent, but ${ArrayDriver.sent.length} were sent.`
      );
    }
    return true;
  }
}

export default ArrayDriver;
