import { IsEnum, IsInt, IsNotEmpty, IsUUID, Min } from 'class-validator';

export enum TransactionType {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
}

export class TransactionRequestDto {
  @IsUUID()
  @IsNotEmpty()
  user_id: string;

  @IsInt()
  @Min(1)
  amount: number;

  @IsEnum(TransactionType)
  type: TransactionType;

  @IsUUID()
  @IsNotEmpty()
  idempotency_key: string;
}
