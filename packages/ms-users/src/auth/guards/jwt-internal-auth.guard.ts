import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtInternalAuthGuard extends AuthGuard('jwt-internal') {}
