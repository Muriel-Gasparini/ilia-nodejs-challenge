import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtInternalStrategy extends PassportStrategy(
  Strategy,
  'jwt-internal',
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_INTERNAL_SECRET || 'ILIACHALLENGE_INTERNAL',
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
