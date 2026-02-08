import 'dotenv/config';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { JwtService } from '@nestjs/jwt';

describe('Internal Authentication (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let externalToken: string;
  let internalToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    jwtService = moduleFixture.get<JwtService>(JwtService);

    externalToken = jwtService.sign(
      { sub: '550e8400-e29b-41d4-a716-446655440000', username: 'testuser' },
      { secret: process.env.JWT_SECRET || 'ILIACHALLENGE', expiresIn: '1h' },
    );

    internalToken = jwtService.sign(
      { sub: 'ms-users', service: 'ms-users' },
      {
        secret: process.env.JWT_INTERNAL_SECRET || 'ILIACHALLENGE_INTERNAL',
        expiresIn: '5m',
      },
    );
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/transactions (POST)', () => {
    it('should accept external JWT token', () => {
      return request(app.getHttpServer())
        .post('/transactions')
        .set('Authorization', `Bearer ${externalToken}`)
        .send({
          user_id: '550e8400-e29b-41d4-a716-446655440000',
          amount: 1000,
          type: 'CREDIT',
          idempotency_key: '550e8400-e29b-41d4-a716-446655440001',
        })
        .expect(201);
    });

    it('should accept internal JWT token', () => {
      return request(app.getHttpServer())
        .post('/transactions')
        .set('Authorization', `Bearer ${internalToken}`)
        .send({
          user_id: '550e8400-e29b-41d4-a716-446655440000',
          amount: 500,
          type: 'CREDIT',
          idempotency_key: '550e8400-e29b-41d4-a716-446655440002',
        })
        .expect(201);
    });

    it('should reject request without token', () => {
      return request(app.getHttpServer())
        .post('/transactions')
        .send({
          user_id: '550e8400-e29b-41d4-a716-446655440000',
          amount: 100,
          type: 'CREDIT',
          idempotency_key: '550e8400-e29b-41d4-a716-446655440003',
        })
        .expect(401);
    });

    it('should reject request with invalid token', () => {
      return request(app.getHttpServer())
        .post('/transactions')
        .set('Authorization', 'Bearer invalid-token')
        .send({
          user_id: '550e8400-e29b-41d4-a716-446655440000',
          amount: 100,
          type: 'CREDIT',
          idempotency_key: '550e8400-e29b-41d4-a716-446655440004',
        })
        .expect(401);
    });
  });

  describe('/balance (GET)', () => {
    it('should accept external JWT token', () => {
      return request(app.getHttpServer())
        .get('/balance')
        .query({ user_id: '550e8400-e29b-41d4-a716-446655440000' })
        .set('Authorization', `Bearer ${externalToken}`)
        .expect(200);
    });

    it('should accept internal JWT token', () => {
      return request(app.getHttpServer())
        .get('/balance')
        .query({ user_id: '550e8400-e29b-41d4-a716-446655440000' })
        .set('Authorization', `Bearer ${internalToken}`)
        .expect(200);
    });

    it('should reject request without token', () => {
      return request(app.getHttpServer())
        .get('/balance')
        .query({ user_id: '550e8400-e29b-41d4-a716-446655440000' })
        .expect(401);
    });
  });

  describe('/transactions (GET)', () => {
    it('should accept external JWT token', () => {
      return request(app.getHttpServer())
        .get('/transactions')
        .set('Authorization', `Bearer ${externalToken}`)
        .expect(200);
    });

    it('should accept internal JWT token', () => {
      return request(app.getHttpServer())
        .get('/transactions')
        .set('Authorization', `Bearer ${internalToken}`)
        .expect(200);
    });

    it('should reject request without token', () => {
      return request(app.getHttpServer()).get('/transactions').expect(401);
    });
  });
});
