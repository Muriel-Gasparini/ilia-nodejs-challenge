import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService, PrismaTransaction } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionType } from '@prisma/client';

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTransactionDto: CreateTransactionDto) {
    return this.prisma.$transaction(async (tx) => {
      await tx.$executeRaw`
        SELECT pg_advisory_xact_lock(
          ('x' || md5(${createTransactionDto.user_id}))::bit(64)::bigint
        )
      `;

      const existing = await tx.transaction.findUnique({
        where: {
          user_id_idempotency_key: {
            user_id: createTransactionDto.user_id,
            idempotency_key: createTransactionDto.idempotency_key,
          },
        },
        select: {
          id: true,
          user_id: true,
          amount: true,
          type: true,
        },
      });

      if (existing) return existing;

      if (createTransactionDto.type === TransactionType.DEBIT) {
        const balance = await this.getBalance(createTransactionDto.user_id, tx);
        if (balance.amount < createTransactionDto.amount) {
          throw new BadRequestException('Insufficient funds');
        }
      }

      return tx.transaction.create({
        data: {
          user_id: createTransactionDto.user_id,
          amount: createTransactionDto.amount,
          type: createTransactionDto.type,
          idempotency_key: createTransactionDto.idempotency_key,
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

  async getBalance(userId: string, tx?: PrismaTransaction) {
    const prisma = tx || this.prisma;
    const result = await prisma.$queryRaw<Array<{ amount: bigint }>>`
      SELECT
        COALESCE(SUM(CASE WHEN type = 'CREDIT' THEN amount ELSE 0 END), 0) -
        COALESCE(SUM(CASE WHEN type = 'DEBIT' THEN amount ELSE 0 END), 0) as amount
      FROM transactions
      WHERE user_id = ${userId}
    `;

    const amount = result[0]?.amount ?? 0n;

    return { amount };
  }
}
