/**
 * Log Mail Driver
 *
 * Logs emails to the application log instead of sending them.
 * Useful for development and testing.
 */

import { MailDriver, SendResult } from './MailDriver';
import { Mailable, MailAddress } from '../Mailable';
import { Log } from '../../Services/Logger';
import { nanoid } from 'nanoid';

export class LogDriver extends MailDriver {
  getName(): string {
    return 'log';
  }

  async send(mailable: Mailable): Promise<SendResult> {
    // Build the mailable
    mailable.build();

    const envelope = mailable.getEnvelope();
    const content = mailable.getContent();
    const attachments = mailable.getAttachments();

    const formatAddress = (addr: MailAddress): string => {
      return addr.name ? `"${addr.name}" <${addr.address}>` : addr.address;
    };

    const messageId = `log-${nanoid()}`;

    const logMessage = [
      '========================================',
      'MAIL LOG',
      '========================================',
      `Message-ID: ${messageId}`,
      `From: ${envelope.from ? formatAddress(envelope.from) : 'default'}`,
      `To: ${envelope.to.map(formatAddress).join(', ')}`,
      envelope.cc.length > 0 ? `CC: ${envelope.cc.map(formatAddress).join(', ')}` : null,
      envelope.bcc.length > 0 ? `BCC: ${envelope.bcc.map(formatAddress).join(', ')}` : null,
      envelope.replyTo ? `Reply-To: ${formatAddress(envelope.replyTo)}` : null,
      `Subject: ${envelope.subject}`,
      '----------------------------------------',
      content.text ? `TEXT:\n${content.text}` : null,
      content.html ? `HTML:\n${content.html}` : null,
      attachments.length > 0
        ? `ATTACHMENTS: ${attachments.map((a) => a.filename).join(', ')}`
        : null,
      '========================================',
    ]
      .filter(Boolean)
      .join('\n');

    Log.info('Mail sent (logged)', {
      messageId,
      to: envelope.to.map((a) => a.address),
      subject: envelope.subject,
      driver: 'log',
    });

    // Also log to console in development
    if (process.env.NODE_ENV !== 'production') {
      console.log(logMessage);
    }

    return {
      success: true,
      messageId,
    };
  }
}

export default LogDriver;
