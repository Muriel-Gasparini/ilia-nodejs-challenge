import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Wallet Integration (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let prismaService: PrismaService;
  let externalToken: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    jwtService = moduleFixture.get<JwtService>(JwtService);
    prismaService = moduleFixture.get<PrismaService>(PrismaService);

    // Create a test user
    const user = await prismaService.user.create({
      data: {
        first_name: 'Test',
        last_name: 'User',
        email: `test-${Date.now()}@example.com`,
        password: 'hashed_password',
      },
    });
    userId = user.id;

    // Generate external JWT token
    externalToken = jwtService.sign(
      { sub: userId, username: 'testuser' },
      { secret: process.env.JWT_SECRET || 'ILIACHALLENGE', expiresIn: '1h' },
    );
  });

  afterAll(async () => {
    // Clean up test user
    if (userId) {
      await prismaService.user.delete({ where: { id: userId } }).catch(() => {
        // Ignore if already deleted
      });
    }
    await app.close();
  });

  describe('Wallet Endpoints', () => {
    it('should create a CREDIT transaction', () => {
      return request(app.getHttpServer())
        .post(`/users/${userId}/wallet/transactions`)
        .set('Authorization', `Bearer ${externalToken}`)
        .send({
          amount: 1000,
          type: 'CREDIT',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.user_id).toBe(userId);
          expect(res.body.amount).toBe(1000);
          expect(res.body.type).toBe('CREDIT');
        });
    });

    it('should get user balance', () => {
      return request(app.getHttpServer())
        .get(`/users/${userId}/wallet/balance`)
        .set('Authorization', `Bearer ${externalToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('balance');
          expect(res.body.user_id).toBe(userId);
          expect(res.body.balance).toBeGreaterThanOrEqual(1000);
        });
    });

    it('should create a DEBIT transaction', () => {
      return request(app.getHttpServer())
        .post(`/users/${userId}/wallet/transactions`)
        .set('Authorization', `Bearer ${externalToken}`)
        .send({
          amount: 500,
          type: 'DEBIT',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.user_id).toBe(userId);
          expect(res.body.amount).toBe(500);
          expect(res.body.type).toBe('DEBIT');
        });
    });

    it('should get updated balance', () => {
      return request(app.getHttpServer())
        .get(`/users/${userId}/wallet/balance`)
        .set('Authorization', `Bearer ${externalToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('balance');
          expect(res.body.user_id).toBe(userId);
          expect(res.body.balance).toBeGreaterThanOrEqual(500);
        });
    });

    it('should list all transactions', () => {
      return request(app.getHttpServer())
        .get(`/users/${userId}/wallet/transactions`)
        .set('Authorization', `Bearer ${externalToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThanOrEqual(2);
        });
    });

    it('should filter transactions by type', () => {
      return request(app.getHttpServer())
        .get(`/users/${userId}/wallet/transactions?type=CREDIT`)
        .set('Authorization', `Bearer ${externalToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          res.body.forEach((transaction: { type: string }) => {
            expect(transaction.type).toBe('CREDIT');
          });
        });
    });

    it('should return 404 for non-existent user', () => {
      return request(app.getHttpServer())
        .get('/users/550e8400-e29b-41d4-a716-446655440000/wallet/balance')
        .set('Authorization', `Bearer ${externalToken}`)
        .expect(404);
    });

    it('should reject request without authentication', () => {
      return request(app.getHttpServer())
        .get(`/users/${userId}/wallet/balance`)
        .expect(401);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid transaction amount', () => {
      return request(app.getHttpServer())
        .post(`/users/${userId}/wallet/transactions`)
        .set('Authorization', `Bearer ${externalToken}`)
        .send({
          amount: 0,
          type: 'CREDIT',
        })
        .expect(400);
    });

    it('should handle invalid transaction type', () => {
      return request(app.getHttpServer())
        .post(`/users/${userId}/wallet/transactions`)
        .set('Authorization', `Bearer ${externalToken}`)
        .send({
          amount: 100,
          type: 'INVALID',
        })
        .expect(400);
    });

    it('should handle missing amount', () => {
      return request(app.getHttpServer())
        .post(`/users/${userId}/wallet/transactions`)
        .set('Authorization', `Bearer ${externalToken}`)
        .send({
          type: 'CREDIT',
        })
        .expect(400);
    });
  });
});
