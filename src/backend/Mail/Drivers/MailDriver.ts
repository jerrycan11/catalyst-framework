/**
 * Mail Driver Interface
 *
 * Contract that all mail drivers must implement.
 */

import { Mailable } from '../Mailable';

export interface SendResult {
  success: boolean;
  messageId?: string;
  error?: Error;
}

export interface MailDriverInterface {
  /**
   * Send a mailable
   */
  send(mailable: Mailable): Promise<SendResult>;

  /**
   * Get the driver name
   */
  getName(): string;
}

export abstract class MailDriver implements MailDriverInterface {
  abstract send(mailable: Mailable): Promise<SendResult>;
  abstract getName(): string;
}

export default MailDriver;
