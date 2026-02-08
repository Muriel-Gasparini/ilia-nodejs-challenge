import 'dotenv/config';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { JwtService } from '@nestjs/jwt';
import { TransactionsClientService } from '../src/transactions-client/transactions-client.service';
import { UsersService } from '../src/users/users.service';

describe('Wallet Integration (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let externalToken: string;
  const userId = '550e8400-e29b-41d4-a716-446655440000';
  let transactionId = 0;

  const mockUsersService = {
    findOne: jest.fn().mockResolvedValue({
      id: userId,
      first_name: 'Test',
      last_name: 'User',
      email: 'test@example.com',
      created_at: new Date(),
      updated_at: new Date(),
    }),
  };

  const mockTransactionsClient = {
    getBalance: jest.fn().mockImplementation((userId: string) =>
      Promise.resolve({
        user_id: userId,
        balance: 1500,
      }),
    ),
    getTransactions: jest
      .fn()
      .mockImplementation((userId: string, type?: string) => {
        const transactions = [
          {
            id: 'txn-1',
            user_id: userId,
            amount: 1000,
            type: 'CREDIT',
            created_at: new Date(),
          },
          {
            id: 'txn-2',
            user_id: userId,
            amount: 500,
            type: 'DEBIT',
            created_at: new Date(),
          },
        ];
        return Promise.resolve(
          type ? transactions.filter((t) => t.type === type) : transactions,
        );
      }),
    createTransaction: jest.fn().mockImplementation((data) =>
      Promise.resolve({
        id: `txn-${++transactionId}`,
        user_id: data.user_id,
        amount: data.amount,
        type: data.type,
        created_at: new Date(),
      }),
    ),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(TransactionsClientService)
      .useValue(mockTransactionsClient)
      .overrideProvider(UsersService)
      .useValue(mockUsersService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    jwtService = moduleFixture.get<JwtService>(JwtService);

    externalToken = jwtService.sign(
      { sub: userId, username: 'testuser' },
      { secret: process.env.JWT_SECRET || 'ILIACHALLENGE', expiresIn: '1h' },
    );
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Wallet Endpoints', () => {
    it('should create a CREDIT transaction', async () => {
      const response = await request(app.getHttpServer())
        .post(`/users/${userId}/wallet/transactions`)
        .set('Authorization', `Bearer ${externalToken}`)
        .send({
          amount: 1000,
          type: 'CREDIT',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.user_id).toBe(userId);
      expect(response.body.amount).toBe(1000);
      expect(response.body.type).toBe('CREDIT');
      expect(mockTransactionsClient.createTransaction).toHaveBeenCalled();
      expect(mockUsersService.findOne).toHaveBeenCalledWith(userId);
    });

    it('should get user balance', async () => {
      const response = await request(app.getHttpServer())
        .get(`/users/${userId}/wallet/balance`)
        .set('Authorization', `Bearer ${externalToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('balance');
      expect(response.body.user_id).toBe(userId);
      expect(response.body.balance).toBe(1500);
      expect(mockTransactionsClient.getBalance).toHaveBeenCalledWith(userId);
      expect(mockUsersService.findOne).toHaveBeenCalledWith(userId);
    });

    it('should create a DEBIT transaction', async () => {
      const response = await request(app.getHttpServer())
        .post(`/users/${userId}/wallet/transactions`)
        .set('Authorization', `Bearer ${externalToken}`)
        .send({
          amount: 500,
          type: 'DEBIT',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.user_id).toBe(userId);
      expect(response.body.amount).toBe(500);
      expect(response.body.type).toBe('DEBIT');
    });

    it('should get updated balance', async () => {
      const response = await request(app.getHttpServer())
        .get(`/users/${userId}/wallet/balance`)
        .set('Authorization', `Bearer ${externalToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('balance');
      expect(response.body.user_id).toBe(userId);
    });

    it('should list all transactions', async () => {
      const response = await request(app.getHttpServer())
        .get(`/users/${userId}/wallet/transactions`)
        .set('Authorization', `Bearer ${externalToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(2);
      expect(mockTransactionsClient.getTransactions).toHaveBeenCalledWith(
        userId,
        undefined,
      );
    });

    it('should filter transactions by type', async () => {
      const response = await request(app.getHttpServer())
        .get(`/users/${userId}/wallet/transactions?type=CREDIT`)
        .set('Authorization', `Bearer ${externalToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach((transaction: { type: string }) => {
        expect(transaction.type).toBe('CREDIT');
      });
      expect(mockTransactionsClient.getTransactions).toHaveBeenCalledWith(
        userId,
        'CREDIT',
      );
    });

    it('should return 404 for non-existent user', async () => {
      mockUsersService.findOne.mockRejectedValueOnce(new Error('Not found'));

      await request(app.getHttpServer())
        .get('/users/999/wallet/balance')
        .set('Authorization', `Bearer ${externalToken}`)
        .expect(404);

      mockUsersService.findOne.mockResolvedValue({
        id: userId,
        first_name: 'Test',
        last_name: 'User',
        email: 'test@example.com',
        created_at: new Date(),
        updated_at: new Date(),
      });
    });

    it('should reject request without authentication', async () => {
      await request(app.getHttpServer())
        .get(`/users/${userId}/wallet/balance`)
        .expect(401);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid transaction amount', async () => {
      await request(app.getHttpServer())
        .post(`/users/${userId}/wallet/transactions`)
        .set('Authorization', `Bearer ${externalToken}`)
        .send({
          amount: 0,
          type: 'CREDIT',
        })
        .expect(400);
    });

    it('should handle invalid transaction type', async () => {
      await request(app.getHttpServer())
        .post(`/users/${userId}/wallet/transactions`)
        .set('Authorization', `Bearer ${externalToken}`)
        .send({
          amount: 100,
          type: 'INVALID',
        })
        .expect(400);
    });

    it('should handle missing amount', async () => {
      await request(app.getHttpServer())
        .post(`/users/${userId}/wallet/transactions`)
        .set('Authorization', `Bearer ${externalToken}`)
        .send({
          type: 'CREDIT',
        })
        .expect(400);
    });
  });
});
