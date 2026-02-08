import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { TransactionsClientService } from '../transactions-client/transactions-client.service';
import { UsersService } from '../users/users.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { v4 as uuidv4 } from 'uuid';

@Controller('users/:userId/wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(
    private readonly transactionsClient: TransactionsClientService,
    private readonly usersService: UsersService,
  ) {}

  private async validateUserExists(userId: string): Promise<void> {
    try {
      await this.usersService.findOne(userId);
    } catch {
      throw new NotFoundException('User not found');
    }
  }

  @Get('balance')
  async getBalance(@Param('userId') userId: string) {
    await this.validateUserExists(userId);
    return this.transactionsClient.getBalance(userId);
  }

  @Get('transactions')
  async getTransactions(
    @Param('userId') userId: string,
    @Query('type') type?: string,
  ) {
    await this.validateUserExists(userId);
    return this.transactionsClient.getTransactions(userId, type);
  }

  @Post('transactions')
  async createTransaction(
    @Param('userId') userId: string,
    @Body() createTransactionDto: CreateTransactionDto,
  ) {
    await this.validateUserExists(userId);
    return this.transactionsClient.createTransaction({
      user_id: userId,
      amount: createTransactionDto.amount,
      type: createTransactionDto.type,
      idempotency_key: uuidv4(),
    });
  }
}
