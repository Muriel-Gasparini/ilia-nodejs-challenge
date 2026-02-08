import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { GetBalanceDto } from './dto/get-balance.dto';
import { TransactionType } from '@prisma/client';
import { JwtOrInternalAuthGuard } from '../auth/guards/jwt-or-internal-auth.guard';

@Controller('transactions')
@UseGuards(JwtOrInternalAuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  async create(@Body() createTransactionDto: CreateTransactionDto) {
    return this.transactionsService.create(createTransactionDto);
  }

  @Get()
  async findAll(@Query('type') type?: TransactionType) {
    return this.transactionsService.findAll(undefined, type);
  }
}

@Controller('balance')
@UseGuards(JwtOrInternalAuthGuard)
export class BalanceController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  async getBalance(@Query() query: GetBalanceDto) {
    const result = await this.transactionsService.getBalance(query.user_id);
    return {
      user_id: query.user_id,
      balance: Number(result.amount),
    };
  }
}
