import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { TransactionsClientService } from './transactions-client.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    JwtModule.register({}),
  ],
  providers: [TransactionsClientService],
  exports: [TransactionsClientService],
})
export class TransactionsClientModule {}
