import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const { url } = request;

    if (url.startsWith('/api/auth') || url.startsWith('/api/template')) {
      return true;
    }
    return super.canActivate(context);
  }
}
