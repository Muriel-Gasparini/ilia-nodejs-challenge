import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { GetBalanceDto } from './dto/get-balance.dto';
import { TransactionType } from '@prisma/client';

@Controller('transactions')
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
export class BalanceController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  getBalance(@Query() query: GetBalanceDto) {
    return this.transactionsService.getBalance(query.user_id);
  }
}
