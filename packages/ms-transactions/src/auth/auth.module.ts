import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtInternalStrategy } from './strategies/jwt-internal.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET') || 'ILIACHALLENGE',
        signOptions: { expiresIn: '24h' },
      }),
    }),
  ],
  providers: [JwtStrategy, JwtInternalStrategy],
  exports: [JwtModule],
})
export class AuthModule {}
