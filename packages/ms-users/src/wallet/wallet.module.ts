import { Module } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { TransactionsClientModule } from '../transactions-client/transactions-client.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TransactionsClientModule, UsersModule],
  controllers: [WalletController],
})
export class WalletModule {}
