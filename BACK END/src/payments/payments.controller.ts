import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';

@ApiTags('Paiements')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('wave')
  @ApiOperation({ summary: 'Traiter un paiement Wave' })
  @ApiResponse({ status: 200, description: 'Paiement Wave traité' })
  processWavePayment(@Body() body: { amount: number; phone: string }) {
    return this.paymentsService.processWavePayment(body.amount, body.phone);
  }

  @Post('orange-money')
  @ApiOperation({ summary: 'Traiter un paiement Orange Money' })
  @ApiResponse({ status: 200, description: 'Paiement Orange Money traité' })
  processOrangeMoneyPayment(@Body() body: { amount: number; phone: string }) {
    return this.paymentsService.processOrangeMoneyPayment(body.amount, body.phone);
  }

  @Post('verify')
  @ApiOperation({ summary: 'Vérifier un paiement' })
  @ApiResponse({ status: 200, description: 'Paiement vérifié' })
  verifyPayment(@Body() body: { transactionId: string }) {
    return this.paymentsService.verifyPayment(body.transactionId);
  }
}