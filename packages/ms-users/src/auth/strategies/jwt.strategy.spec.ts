import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret';
    const configService = new ConfigService();
    strategy = new JwtStrategy(configService);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('should validate payload and return user data', () => {
    const payload = {
      sub: 'user-id-123',
      email: 'test@example.com',
    };

    const result = strategy.validate(payload);

    expect(result).toEqual({
      userId: 'user-id-123',
      email: 'test@example.com',
    });
  });

  it('should handle payload with additional fields', () => {
    const payload = {
      sub: 'user-id-456',
      email: 'another@example.com',
    };

    const result = strategy.validate(payload);

    expect(result).toEqual({
      userId: 'user-id-456',
      email: 'another@example.com',
    });
  });

  it('should throw UnauthorizedException when payload has no sub', () => {
    const payload = {
      email: 'test@example.com',
    };

    expect(() => strategy.validate(payload)).toThrow(UnauthorizedException);
  });
});
