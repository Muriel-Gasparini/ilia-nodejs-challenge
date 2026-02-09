import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService, PrismaTransaction } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(createTransactionDto: CreateTransactionDto) {
    const { user_id, amount, type, idempotency_key } = createTransactionDto;

    this.logger.log({
      message: 'Creating transaction',
      type,
      amount,
      idempotency_key,
    });

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        await tx.$executeRaw`
          SELECT pg_advisory_xact_lock(
            ('x' || md5(${user_id}))::bit(64)::bigint
          )
        `;

        const existing = await tx.transaction.findUnique({
          where: {
            user_id_idempotency_key: {
              user_id,
              idempotency_key,
            },
          },
          select: {
            id: true,
            user_id: true,
            amount: true,
            type: true,
          },
        });

        if (existing) {
          this.logger.log({
            message: 'Transaction already exists (idempotency)',
            transaction_id: existing.id,
            idempotency_key,
          });
          return existing;
        }

        if (type === TransactionType.DEBIT) {
          const balance = await this.getBalance(user_id, tx);
          const requestedAmount = new Decimal(amount);
          if (balance.amount.lessThan(requestedAmount)) {
            this.logger.warn({
              message: 'Insufficient funds',
              requested_amount: requestedAmount.toString(),
              available_balance: balance.amount.toString(),
              idempotency_key,
            });
            throw new BadRequestException('Insufficient funds');
          }
        }

        const transaction = await tx.transaction.create({
          data: {
            user_id,
            amount,
            type,
            idempotency_key,
          },
          select: {
            id: true,
            user_id: true,
            amount: true,
            type: true,
          },
        });

        this.logger.log({
          message: 'Transaction created successfully',
          transaction_id: transaction.id,
          type: transaction.type,
          amount: transaction.amount,
          idempotency_key,
        });

        return transaction;
      });

      return result;
    } catch (error) {
      this.logger.error({
        message: 'Transaction creation failed',
        error: error.message,
        type,
        amount,
        idempotency_key,
      });
      throw error;
    }
  }

  async findAll(userId?: string, type?: TransactionType) {
    this.logger.log({
      message: 'Fetching transactions',
      filters: { type },
    });

    const transactions = await this.prisma.transaction.findMany({
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

    this.logger.log({
      message: 'Transactions fetched',
      count: transactions.length,
    });

    return transactions;
  }

  async getBalance(userId: string, tx?: PrismaTransaction) {
    this.logger.log({
      message: 'Fetching balance',
    });

    const prisma = tx || this.prisma;
    const result = await prisma.$queryRaw<Array<{ amount: Decimal }>>`
      SELECT
        COALESCE(SUM(CASE WHEN type = 'CREDIT' THEN amount ELSE 0 END), 0) -
        COALESCE(SUM(CASE WHEN type = 'DEBIT' THEN amount ELSE 0 END), 0) as amount
      FROM transactions
      WHERE user_id = ${userId}
    `;

    const amount = result[0]?.amount ?? new Decimal(0);

    this.logger.log({
      message: 'Balance fetched',
      balance: amount.toString(),
    });

    return { amount };
  }
}
