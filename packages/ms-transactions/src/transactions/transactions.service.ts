import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionType } from '@prisma/client';

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTransactionDto: CreateTransactionDto) {
    return this.prisma.$transaction(async (tx) => {
      if (createTransactionDto.type === TransactionType.DEBIT) {
        const balance = await this.getBalance(createTransactionDto.user_id);
        if (balance.amount < createTransactionDto.amount) {
          throw new BadRequestException('Insufficient funds');
        }
      }

      return tx.transaction.create({
        data: {
          user_id: createTransactionDto.user_id,
          amount: createTransactionDto.amount,
          type: createTransactionDto.type,
        },
        select: {
          id: true,
          user_id: true,
          amount: true,
          type: true,
        },
      });
    });
  }

  async findAll(userId?: string, type?: TransactionType) {
    return this.prisma.transaction.findMany({
      where: {
        ...(userId && { user_id: userId }),
        ...(type && { type }),
      },
      select: {
        id: true,
        user_id: true,
        amount: true,
        type: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async getBalance(userId: string) {
    const result = await this.prisma.$queryRaw<Array<{ amount: bigint }>>`
      SELECT
        COALESCE(SUM(CASE WHEN type = 'CREDIT' THEN amount ELSE 0 END), 0) -
        COALESCE(SUM(CASE WHEN type = 'DEBIT' THEN amount ELSE 0 END), 0) as amount
      FROM transactions
      WHERE user_id = ${userId}
    `;

    return {
      amount: Number(result[0].amount),
    };
  }
}
