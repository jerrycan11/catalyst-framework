/**
 * AWS SES Mail Driver
 *
 * Sends emails via Amazon Simple Email Service (SES).
 * Requires @aws-sdk/client-ses package.
 *
 * @example
 * ```bash
 * npm install @aws-sdk/client-ses
 * ```
 */

import { MailDriver, SendResult } from './MailDriver';
import { Mailable, MailAddress } from '../Mailable';
import mailConfig from '../../../../config/mail';

export class SesDriver extends MailDriver {
  private region: string;
  private accessKeyId?: string;
  private secretAccessKey?: string;

  constructor(config?: { region?: string; accessKeyId?: string; secretAccessKey?: string }) {
    super();
    this.region = config?.region || process.env.AWS_DEFAULT_REGION || 'us-east-1';
    this.accessKeyId = config?.accessKeyId || process.env.AWS_ACCESS_KEY_ID;
    this.secretAccessKey = config?.secretAccessKey || process.env.AWS_SECRET_ACCESS_KEY;
  }

  getName(): string {
    return 'ses';
  }

  async send(mailable: Mailable): Promise<SendResult> {
    // Build the mailable
    mailable.build();

    const envelope = mailable.getEnvelope();
    const content = mailable.getContent();

    try {
      // Dynamic import AWS SDK (it's an optional dependency)
      // @ts-expect-error - AWS SDK is optional and may not be installed
      const { SESClient, SendEmailCommand } = await import('@aws-sdk/client-ses');

      // Configure SES client
      const clientConfig: {
        region: string;
        credentials?: { accessKeyId: string; secretAccessKey: string };
      } = {
        region: this.region,
      };

      // Only add credentials if explicitly provided (otherwise use default credential chain)
      if (this.accessKeyId && this.secretAccessKey) {
        clientConfig.credentials = {
          accessKeyId: this.accessKeyId,
          secretAccessKey: this.secretAccessKey,
        };
      }

      const client = new SESClient(clientConfig);

      const from = envelope.from || mailConfig.from;
      const formatAddress = (addr: MailAddress): string => {
        return addr.name ? `${addr.name} <${addr.address}>` : addr.address;
      };

      // Build email parameters
      const params = {
        Source: formatAddress(from as MailAddress),
        Destination: {
          ToAddresses: envelope.to.map((addr) => addr.address),
          CcAddresses: envelope.cc.length > 0 ? envelope.cc.map((addr) => addr.address) : undefined,
          BccAddresses: envelope.bcc.length > 0 ? envelope.bcc.map((addr) => addr.address) : undefined,
        },
        Message: {
          Subject: {
            Data: envelope.subject,
            Charset: 'UTF-8',
          },
          Body: {
            ...(content.html && {
              Html: {
                Data: content.html,
                Charset: 'UTF-8',
              },
            }),
            ...(content.text && {
              Text: {
                Data: content.text,
                Charset: 'UTF-8',
              },
            }),
          },
        },
        ReplyToAddresses: envelope.replyTo ? [envelope.replyTo.address] : undefined,
      };

      const command = new SendEmailCommand(params);
      const result = await client.send(command);

      return {
        success: true,
        messageId: result.MessageId,
      };
    } catch (error) {
      // Check if AWS SDK is not installed
      if (error instanceof Error && error.message.includes('Cannot find module')) {
        return {
          success: false,
          error: new Error(
            'AWS SDK not installed. Run: npm install @aws-sdk/client-ses'
          ),
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }
}

export default SesDriver;
