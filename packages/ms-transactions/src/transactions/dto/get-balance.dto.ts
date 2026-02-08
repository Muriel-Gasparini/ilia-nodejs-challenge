import { IsUUID, IsNotEmpty } from 'class-validator';

export class GetBalanceDto {
  @IsUUID()
  @IsNotEmpty()
  user_id: string;
}
