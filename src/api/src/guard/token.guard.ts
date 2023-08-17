import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { Reflector } from "@nestjs/core";
import { PUBLIC_DECORATOR_KEY } from "../auth/guards/PublicDecorator";

@Injectable()
export class TokenGuard implements CanActivate {
  public constructor(
    private readonly authService: AuthService,
    private readonly reflector: Reflector) {}

  public canActivate(context: ExecutionContext): boolean {
    if (context.getType() !== 'http') return true;

    // Check if the handler or the class is decorated with the Public decorator
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      PUBLIC_DECORATOR_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];

    if (!token) {
      console.log(`No token: ${request.url}`);
      return false;
    }

    if (this.authService.validateToken(token).isOk()) return true;
    else {
      console.log(`Invalid token: ${request.url}`);
      return false;
    }
  }
}
