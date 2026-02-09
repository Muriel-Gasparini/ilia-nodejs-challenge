import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TransactionsClientService } from '../transactions-client/transactions-client.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users/:userId/wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private readonly transactionsClient: TransactionsClientService) {}

  @Get('balance')
  async getBalance(@Param('userId') userId: string) {
    return this.transactionsClient.getBalance(userId);
  }

  @Get('transactions')
  async getTransactions(
    @Param('userId') userId: string,
    @Query('type') type?: string,
  ) {
    return this.transactionsClient.getTransactions(userId, type);
  }

  @Post('transactions')
  async createTransaction(
    @Param('userId') userId: string,
    @Body() createTransactionDto: CreateTransactionDto,
  ) {
    return this.transactionsClient.createTransaction({
      user_id: userId,
      amount: createTransactionDto.amount,
      type: createTransactionDto.type,
      idempotency_key: createTransactionDto.idempotency_key,
    });
  }
}
