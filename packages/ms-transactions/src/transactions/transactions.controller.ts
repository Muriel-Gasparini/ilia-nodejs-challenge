import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { FindAllTransactionsDto } from './dto/find-all-transactions.dto';
import { GetBalanceDto } from './dto/get-balance.dto';
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
  async findAll(@Query() query: FindAllTransactionsDto) {
    return this.transactionsService.findAll(
      query.user_id,
      query.type,
      query.page ?? 1,
      query.limit ?? 20,
    );
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
