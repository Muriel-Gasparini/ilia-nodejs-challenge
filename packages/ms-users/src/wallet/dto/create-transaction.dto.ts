import { IsEnum, IsInt, Min } from 'class-validator';
import { TransactionType } from '../../transactions-client/dto/transaction-request.dto';

export class CreateTransactionDto {
  @IsInt()
  @Min(1)
  amount: number;

  @IsEnum(TransactionType)
  type: TransactionType;
}
