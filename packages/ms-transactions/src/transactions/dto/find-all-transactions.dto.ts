import {
  IsOptional,
  IsUUID,
  IsEnum,
  IsInt,
  IsNotEmpty,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TransactionType } from '../../../generated/prisma';

export class FindAllTransactionsDto {
  @IsUUID()
  @IsNotEmpty()
  user_id: string;

  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
