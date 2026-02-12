import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { TransactionsClientService } from '../transactions-client/transactions-client.service';
import { UsersService } from '../users/users.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('users/:userId/wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(
    private readonly transactionsClient: TransactionsClientService,
    private readonly usersService: UsersService,
  ) {}

  private async validateOwnership(
    authenticatedUserId: string,
    requestedUserId: string,
  ) {
    if (authenticatedUserId !== requestedUserId) {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: 'You can only access your own wallet',
      });
    }

    const exists = await this.usersService.exists(requestedUserId);
    if (!exists) {
      throw new UnauthorizedException({
        code: 'UNAUTHORIZED',
        message: 'User no longer exists',
      });
    }
  }

  @Get('balance')
  async getBalance(
    @CurrentUser() user: { userId: string },
    @Param('userId') userId: string,
  ) {
    await this.validateOwnership(user.userId, userId);
    return this.transactionsClient.getBalance(userId);
  }

  @Get('transactions')
  async getTransactions(
    @CurrentUser() user: { userId: string },
    @Param('userId') userId: string,
    @Query('type') type?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    await this.validateOwnership(user.userId, userId);
    return this.transactionsClient.getTransactions(
      userId,
      type,
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
    );
  }

  @Post('transactions')
  async createTransaction(
    @CurrentUser() user: { userId: string },
    @Param('userId') userId: string,
    @Body() createTransactionDto: CreateTransactionDto,
  ) {
    await this.validateOwnership(user.userId, userId);
    return this.transactionsClient.createTransaction({
      user_id: userId,
      amount: createTransactionDto.amount,
      type: createTransactionDto.type,
      idempotency_key: createTransactionDto.idempotency_key,
    });
  }
}
