import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class TokenGuard implements CanActivate {
  public constructor(private authService: AuthService) {}

  public canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.token;

    if (!token) {
      console.log(`No token: ${request.url}`);
      // throw new ForbiddenException('Token missing');
      return false;
    }

    if (this.authService.validateToken(token)) return true;
    else {
      console.log(`Invalid token: ${request.url}`);
      // throw new ForbiddenException('Token expired');
      return false;
    }
  }
}
