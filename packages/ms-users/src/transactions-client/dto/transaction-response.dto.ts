import { TransactionType } from './transaction-request.dto';

export class TransactionResponseDto {
  id: string;
  user_id: string;
  amount: number;
  type: TransactionType;
  created_at: Date;
}
