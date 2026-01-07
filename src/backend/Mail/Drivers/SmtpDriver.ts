/**
 * SMTP Mail Driver
 *
 * Sends emails via SMTP using nodemailer.
 */

import { MailDriver, SendResult } from './MailDriver';
import { Mailable, MailAddress } from '../Mailable';
import mailConfig, { MailerConfig } from '../../../../config/mail';

export class SmtpDriver extends MailDriver {
  private config: MailerConfig;

  constructor(config?: MailerConfig) {
    super();
    this.config = config || mailConfig.mailers.smtp;
  }

  getName(): string {
    return 'smtp';
  }

  async send(mailable: Mailable): Promise<SendResult> {
    // Build the mailable
    mailable.build();

    const envelope = mailable.getEnvelope();
    const content = mailable.getContent();
    const attachments = mailable.getAttachments();

    try {
      // Dynamic import nodemailer (it's an optional dependency)
      // @ts-expect-error - Nodemailer is optional and may not be installed
      const nodemailer = await import('nodemailer');

      const transporter = nodemailer.createTransport({
        host: this.config.host,
        port: this.config.port,
        secure: this.config.encryption === 'ssl',
        auth: {
          user: this.config.username,
          pass: this.config.password,
        },
        tls: this.config.encryption === 'tls' ? { rejectUnauthorized: false } : undefined,
      });

      const from = envelope.from || mailConfig.from;
      const formatAddress = (addr: MailAddress): string => {
        return addr.name ? `"${addr.name}" <${addr.address}>` : addr.address;
      };

      const result = await transporter.sendMail({
        from: formatAddress(from as MailAddress),
        to: envelope.to.map(formatAddress).join(', '),
        cc: envelope.cc.length > 0 ? envelope.cc.map(formatAddress).join(', ') : undefined,
        bcc: envelope.bcc.length > 0 ? envelope.bcc.map(formatAddress).join(', ') : undefined,
        replyTo: envelope.replyTo ? formatAddress(envelope.replyTo) : undefined,
        subject: envelope.subject,
        html: content.html,
        text: content.text,
        attachments: attachments.map((att) => ({
          filename: att.filename,
          content: att.content,
          contentType: att.contentType,
          encoding: att.encoding,
        })),
      });

      return {
        success: true,
        messageId: result.messageId,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }
}

export default SmtpDriver;
