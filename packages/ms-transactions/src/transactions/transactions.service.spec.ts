import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsService } from './transactions.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';
import { TransactionType } from '@prisma/client';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    $transaction: jest.fn(),
    transaction: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    $queryRaw: jest.fn(),
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
    prisma = module.get<PrismaService>(PrismaService);
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
      };

      const expected = { ...dto, id: 'tx-123' };

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback(mockPrismaService);
      });

      mockPrismaService.transaction.create.mockResolvedValue(expected);

      const result = await service.create(dto);

      expect(result).toEqual(expected);
      expect(mockPrismaService.$transaction).toHaveBeenCalledTimes(1);
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
      };

      const expected = { ...dto, id: 'tx-456' };

      mockPrismaService.$queryRaw.mockResolvedValue([
        { amount: BigInt(1000) },
      ]);

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback(mockPrismaService);
      });

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
      };

      mockPrismaService.$queryRaw.mockResolvedValue([
        { amount: BigInt(1000) },
      ]);

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback(mockPrismaService);
      });

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
      await expect(service.create(dto)).rejects.toThrow('Insufficient funds');
      expect(mockPrismaService.$queryRaw).toHaveBeenCalled();
      expect(mockPrismaService.transaction.create).not.toHaveBeenCalled();
    });
  });

  describe('getBalance', () => {
    it('should return correct balance with mixed transactions', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      mockPrismaService.$queryRaw.mockResolvedValue([{ amount: BigInt(500) }]);

      const result = await service.getBalance(userId);

      expect(result.amount).toBe(500);
      expect(mockPrismaService.$queryRaw).toHaveBeenCalledTimes(1);
    });

    it('should return 0 for user with no transactions', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      mockPrismaService.$queryRaw.mockResolvedValue([{ amount: BigInt(0) }]);

      const result = await service.getBalance(userId);

      expect(result.amount).toBe(0);
    });
  });

  describe('findAll', () => {
    it('should filter by user_id', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      mockPrismaService.transaction.findMany.mockResolvedValue([]);

      await service.findAll(userId);

      expect(mockPrismaService.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ user_id: userId }),
        }),
      );
    });

    it('should filter by type', async () => {
      mockPrismaService.transaction.findMany.mockResolvedValue([]);

      await service.findAll(undefined, TransactionType.CREDIT);

      expect(mockPrismaService.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ type: TransactionType.CREDIT }),
        }),
      );
    });
  });
});
