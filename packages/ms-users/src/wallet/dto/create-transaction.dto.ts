import { IsEnum, IsInt, Min, IsUUID, IsNotEmpty } from 'class-validator';
import { TransactionType } from '../../transactions-client/dto/transaction-request.dto';

export class CreateTransactionDto {
  @IsInt()
  @Min(1)
  amount: number;

  @IsEnum(TransactionType)
  type: TransactionType;

  @IsUUID('4')
  @IsNotEmpty()
  idempotency_key: string;
}
