import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtOrInternalAuthGuard extends AuthGuard(['jwt', 'jwt-internal']) {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }
}
