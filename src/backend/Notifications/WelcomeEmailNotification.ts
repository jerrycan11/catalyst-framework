/**
 * WelcomeEmailNotification
 * 
 * Notification class for sending alerts via various channels.
 */

export interface WelcomeEmailNotificationData {
  // Define your notification data here
  // Example:
  // userId: string;
  // message: string;
}

export interface MailMessage {
  subject: string;
  greeting?: string;
  lines: string[];
  action?: {
    text: string;
    url: string;
  };
  salutation?: string;
}

export interface NotifiableUser {
  id: string;
  email: string;
  name: string;
}

export class WelcomeEmailNotification {
  private data: WelcomeEmailNotificationData;

  constructor(data: WelcomeEmailNotificationData) {
    this.data = data;
  }

  /**
   * Get the notification's delivery channels.
   */
  via(notifiable: NotifiableUser): string[] {
    return ['mail'];
  }

  /**
   * Get the mail representation of the notification.
   */
  toMarkdownMail(notifiable: NotifiableUser): MailMessage {
    return {
      subject: 'WelcomeEmail',
      greeting: `Hello ${notifiable.name}!`,
      lines: [
        'This is a notification from your application.',
        'You can customize this message in the WelcomeEmailNotification class.',
      ],
      action: {
        text: 'View Details',
        url: process.env.APP_URL || 'http://localhost:3000',
      },
      salutation: 'Best regards,\nThe Team',
    };
  }

  /**
   * Get the database representation of the notification.
   */
  toDatabase(notifiable: NotifiableUser): Record<string, unknown> {
    return {
      type: 'WelcomeEmailNotification',
      data: this.data,
      notifiable_id: notifiable.id,
      created_at: new Date(),
    };
  }

  /**
   * Get the array representation of the notification.
   */
  toArray(): WelcomeEmailNotificationData {
    return this.data;
  }
}

export default WelcomeEmailNotification;
