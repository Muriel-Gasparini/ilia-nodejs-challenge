import {
  IsEnum,
  IsNumber,
  Min,
  Max,
  IsUUID,
  IsNotEmpty,
} from 'class-validator';
import { TransactionType } from '../../transactions-client/dto/transaction-request.dto';

export class CreateTransactionDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(999_999_999.99)
  amount: number;

  @IsEnum(TransactionType)
  type: TransactionType;

  @IsUUID('4')
  @IsNotEmpty()
  idempotency_key: string;
}
