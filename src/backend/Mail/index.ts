/**
 * Catalyst Mail Module
 *
 * Export all mail-related classes and utilities.
 */

export { Mailable, type MailAddress, type MailAttachment } from './Mailable';
export { MailDriver, type MailDriverInterface, type SendResult } from './Drivers/MailDriver';
export { SmtpDriver } from './Drivers/SmtpDriver';
export { LogDriver } from './Drivers/LogDriver';
export { ArrayDriver, type SentMail } from './Drivers/ArrayDriver';
export { SesDriver } from './Drivers/SesDriver';
