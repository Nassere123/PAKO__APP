import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('sms')
  @ApiOperation({ summary: 'Envoyer un SMS' })
  @ApiResponse({ status: 200, description: 'SMS envoyé' })
  sendSMS(@Body() body: { phone: string; message: string }) {
    return this.notificationsService.sendSMS(body.phone, body.message);
  }

  @Post('email')
  @ApiOperation({ summary: 'Envoyer un email' })
  @ApiResponse({ status: 200, description: 'Email envoyé' })
  sendEmail(@Body() body: { email: string; subject: string; message: string }) {
    return this.notificationsService.sendEmail(body.email, body.subject, body.message);
  }

  @Post('push')
  @ApiOperation({ summary: 'Envoyer une notification push' })
  @ApiResponse({ status: 200, description: 'Notification push envoyée' })
  sendPushNotification(@Body() body: { userId: string; title: string; message: string }) {
    return this.notificationsService.sendPushNotification(body.userId, body.title, body.message);
  }
}
