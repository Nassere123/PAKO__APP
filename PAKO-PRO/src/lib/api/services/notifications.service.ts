import { httpClient } from '../http-client';

class NotificationsService {
  // Envoyer un SMS
  async sendSMS(phone: string, message: string): Promise<boolean> {
    return httpClient.post<boolean>('notifications/sms', { phone, message });
  }

  // Envoyer une notification push
  async sendPushNotification(userId: string, title: string, message: string): Promise<boolean> {
    return httpClient.post<boolean>('notifications/push', { userId, title, message });
  }
}

export const notificationsService = new NotificationsService();

