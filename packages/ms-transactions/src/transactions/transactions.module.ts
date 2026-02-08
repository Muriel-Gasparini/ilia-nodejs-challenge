import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import {
  TransactionsController,
  BalanceController,
} from './transactions.controller';

@Module({
  controllers: [TransactionsController, BalanceController],
  providers: [TransactionsService],
})
export class TransactionsModule {}
