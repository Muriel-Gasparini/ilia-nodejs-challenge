import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { TransactionsClientService } from '../transactions-client/transactions-client.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('users/:userId/wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private readonly transactionsClient: TransactionsClientService) {}

  private validateOwnership(
    authenticatedUserId: string,
    requestedUserId: string,
  ) {
    if (authenticatedUserId !== requestedUserId) {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: 'You can only access your own wallet',
      });
    }
  }

  @Get('balance')
  async getBalance(
    @CurrentUser() user: { userId: string },
    @Param('userId') userId: string,
  ) {
    this.validateOwnership(user.userId, userId);
    return this.transactionsClient.getBalance(userId);
  }

  @Get('transactions')
  async getTransactions(
    @CurrentUser() user: { userId: string },
    @Param('userId') userId: string,
    @Query('type') type?: string,
  ) {
    this.validateOwnership(user.userId, userId);
    return this.transactionsClient.getTransactions(userId, type);
  }

  @Post('transactions')
  async createTransaction(
    @CurrentUser() user: { userId: string },
    @Param('userId') userId: string,
    @Body() createTransactionDto: CreateTransactionDto,
  ) {
    this.validateOwnership(user.userId, userId);
    return this.transactionsClient.createTransaction({
      user_id: userId,
      amount: createTransactionDto.amount,
      type: createTransactionDto.type,
      idempotency_key: createTransactionDto.idempotency_key,
    });
  }
}
