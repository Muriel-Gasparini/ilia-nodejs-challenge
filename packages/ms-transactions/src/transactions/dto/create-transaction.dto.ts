import {
  IsEnum,
  IsNumber,
  IsNotEmpty,
  IsUUID,
  Min,
  Max,
} from 'class-validator';
import { TransactionType } from '../../../generated/prisma';

export class CreateTransactionDto {
  @IsUUID()
  @IsNotEmpty()
  user_id: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(999_999_999.99)
  amount: number;

  @IsEnum(TransactionType)
  type: TransactionType;

  @IsUUID()
  @IsNotEmpty()
  idempotency_key: string;
}
