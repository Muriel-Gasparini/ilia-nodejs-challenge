import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('ILIACHALLENGE'),
          },
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  it('should validate token and return user', () => {
    const payload = { sub: '123', username: 'testuser' };
    const result = strategy.validate(payload);

    expect(result).toEqual({ userId: '123', username: 'testuser' });
  });

  it('should throw UnauthorizedException for invalid payload', () => {
    const payload = { username: 'testuser' };

    expect(() => strategy.validate(payload)).toThrow(UnauthorizedException);
  });
});
