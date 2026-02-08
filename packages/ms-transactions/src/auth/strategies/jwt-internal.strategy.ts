import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtInternalStrategy extends PassportStrategy(
  Strategy,
  'jwt-internal',
) {
  constructor(private config: ConfigService) {
    const jwtInternalSecret = config.get<string>('JWT_INTERNAL_SECRET');
    if (!jwtInternalSecret) {
      throw new Error('JWT_INTERNAL_SECRET environment variable is required');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtInternalSecret,
    });
  }

  validate(payload: { sub?: string; service?: string }): {
    serviceId: string;
    service?: string;
  } {
    if (!payload.sub) {
      throw new UnauthorizedException();
    }
    return { serviceId: payload.sub, service: payload.service };
  }
}
