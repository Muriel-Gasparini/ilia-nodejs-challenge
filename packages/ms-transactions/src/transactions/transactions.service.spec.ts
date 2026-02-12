import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsService } from './transactions.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';

enum TransactionType {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
}

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(),
  TransactionType: {
    CREDIT: 'CREDIT',
    DEBIT: 'DEBIT',
  },
}));

describe('TransactionsService', () => {
  let service: TransactionsService;

  const mockPrismaService = {
    $transaction: jest.fn(),
    $executeRaw: jest.fn(),
    $queryRaw: jest.fn(),
    transaction: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create CREDIT transaction', async () => {
      const dto = {
        user_id: '123e4567-e89b-12d3-a456-426614174000',
        amount: 1000,
        type: TransactionType.CREDIT,
        idempotency_key: 'idempotency-123',
      };

      const expected = {
        id: 'tx-123',
        user_id: dto.user_id,
        amount: dto.amount,
        type: dto.type,
      };

      mockPrismaService.$transaction.mockImplementation(
        (callback: (tx: typeof mockPrismaService) => Promise<unknown>) =>
          callback(mockPrismaService),
      );

      mockPrismaService.$executeRaw.mockResolvedValue(undefined);
      mockPrismaService.transaction.findUnique.mockResolvedValue(null);
      mockPrismaService.transaction.create.mockResolvedValue(expected);

      const result = await service.create(dto);

      expect(result).toEqual(expected);
      expect(mockPrismaService.$transaction).toHaveBeenCalledTimes(1);
      expect(mockPrismaService.$executeRaw).toHaveBeenCalled();
      expect(mockPrismaService.transaction.findUnique).toHaveBeenCalled();
      expect(mockPrismaService.transaction.create).toHaveBeenCalledWith({
        data: dto,
        select: {
          id: true,
          user_id: true,
          amount: true,
          type: true,
        },
      });
    });

    it('should create DEBIT when balance is sufficient', async () => {
      const dto = {
        user_id: '123e4567-e89b-12d3-a456-426614174000',
        amount: 500,
        type: TransactionType.DEBIT,
        idempotency_key: 'idempotency-456',
      };

      const expected = {
        id: 'tx-456',
        user_id: dto.user_id,
        amount: dto.amount,
        type: dto.type,
      };

      mockPrismaService.$queryRaw.mockResolvedValue([{ amount: BigInt(1000) }]);

      mockPrismaService.$transaction.mockImplementation(
        (callback: (tx: typeof mockPrismaService) => Promise<unknown>) =>
          callback(mockPrismaService),
      );

      mockPrismaService.$executeRaw.mockResolvedValue(undefined);
      mockPrismaService.transaction.findUnique.mockResolvedValue(null);
      mockPrismaService.transaction.create.mockResolvedValue(expected);

      const result = await service.create(dto);

      expect(result).toEqual(expected);
      expect(mockPrismaService.$queryRaw).toHaveBeenCalledTimes(1);
      expect(mockPrismaService.transaction.create).toHaveBeenCalledWith({
        data: dto,
        select: {
          id: true,
          user_id: true,
          amount: true,
          type: true,
        },
      });
    });

    it('should throw BadRequestException when insufficient funds', async () => {
      const dto = {
        user_id: '123e4567-e89b-12d3-a456-426614174000',
        amount: 1500,
        type: TransactionType.DEBIT,
        idempotency_key: 'idempotency-789',
      };

      mockPrismaService.$queryRaw.mockResolvedValue([{ amount: BigInt(1000) }]);

      mockPrismaService.$transaction.mockImplementation(
        (callback: (tx: typeof mockPrismaService) => Promise<unknown>) =>
          callback(mockPrismaService),
      );

      mockPrismaService.$executeRaw.mockResolvedValue(undefined);
      mockPrismaService.transaction.findUnique.mockResolvedValue(null);

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
      await expect(service.create(dto)).rejects.toThrow('Insufficient funds');
      expect(mockPrismaService.$queryRaw).toHaveBeenCalled();
      expect(mockPrismaService.transaction.create).not.toHaveBeenCalled();
    });

    it('should return existing transaction when idempotency key already exists', async () => {
      const dto = {
        user_id: '123e4567-e89b-12d3-a456-426614174000',
        amount: 500,
        type: TransactionType.CREDIT,
        idempotency_key: 'idempotency-existing',
      };

      const existing = {
        id: 'tx-existing',
        user_id: dto.user_id,
        amount: dto.amount,
        type: dto.type,
      };

      mockPrismaService.$transaction.mockImplementation(
        (callback: (tx: typeof mockPrismaService) => Promise<unknown>) =>
          callback(mockPrismaService),
      );

      mockPrismaService.$executeRaw.mockResolvedValue(undefined);
      mockPrismaService.transaction.findUnique.mockResolvedValue(existing);

      const result = await service.create(dto);

      expect(result).toEqual(existing);
      expect(mockPrismaService.transaction.findUnique).toHaveBeenCalled();
      expect(mockPrismaService.transaction.create).not.toHaveBeenCalled();
    });
  });

  describe('getBalance', () => {
    it('should return correct balance with mixed transactions', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      mockPrismaService.$queryRaw.mockResolvedValue([{ amount: BigInt(500) }]);

      const result = await service.getBalance(userId);

      expect(result.amount).toBe(500n);
      expect(mockPrismaService.$queryRaw).toHaveBeenCalledTimes(1);
    });

    it('should return 0 for user with no transactions', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      mockPrismaService.$queryRaw.mockResolvedValue([{ amount: BigInt(0) }]);

      const result = await service.getBalance(userId);

      expect(result.amount).toBe(0n);
    });
  });

  describe('findAll', () => {
    const userId = '123e4567-e89b-12d3-a456-426614174000';

    it('should return paginated response with meta', async () => {
      mockPrismaService.transaction.findMany.mockResolvedValue([]);
      mockPrismaService.transaction.count.mockResolvedValue(0);

      const result = await service.findAll(userId);

      expect(result).toEqual({
        data: [],
        meta: { total: 0, page: 1, limit: 20, totalPages: 0 },
      });
    });

    it('should filter by user_id', async () => {
      mockPrismaService.transaction.findMany.mockResolvedValue([]);
      mockPrismaService.transaction.count.mockResolvedValue(0);

      await service.findAll(userId);

      expect(mockPrismaService.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ user_id: userId }) as Record<
            string,
            unknown
          >,
        }) as Record<string, unknown>,
      );
    });

    it('should filter by type', async () => {
      mockPrismaService.transaction.findMany.mockResolvedValue([]);
      mockPrismaService.transaction.count.mockResolvedValue(0);

      await service.findAll(userId, TransactionType.CREDIT);

      expect(mockPrismaService.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            user_id: userId,
            type: TransactionType.CREDIT,
          }) as Record<string, unknown>,
        }) as Record<string, unknown>,
      );
    });

    it('should apply pagination with skip and take', async () => {
      mockPrismaService.transaction.findMany.mockResolvedValue([]);
      mockPrismaService.transaction.count.mockResolvedValue(50);

      const result = await service.findAll(userId, undefined, 3, 10);

      expect(mockPrismaService.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20,
          take: 10,
        }) as Record<string, unknown>,
      );
      expect(result.meta).toEqual({
        total: 50,
        page: 3,
        limit: 10,
        totalPages: 5,
      });
    });
  });
});
