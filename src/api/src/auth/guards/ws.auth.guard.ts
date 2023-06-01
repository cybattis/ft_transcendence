import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { AuthedSocket } from "../types/auth.types";
import { JwtService } from "@nestjs/jwt";

/*
 * This guard is used to authenticate websocket communications using the Jwt.
 * Warning: If used on a WebSocketGateway, this guard will not prevent the initial connection (NestJS limitation).
 * It blocks-off incoming messages from unauthorized clients.
 */
@Injectable()
export class WsAuthGuard implements CanActivate {
  private readonly logger = new Logger(WsAuthGuard.name);

  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    if (context.getType() !== 'ws') return true;

    const client: AuthedSocket = context.switchToWs().getClient();

    if (!WsAuthGuard.validateSocketToken(client, this.jwtService)) {
      this.logger.log(`Unauthorized connection from ${client.handshake?.address}`);
      return false;
    }
    return true;
  }

  /*
   * This function is used to validate the authentication of a socket by looking at its handshake data for the Jwt.
   * It returns true if the socket is authenticated, false otherwise.
   *
   * @param client The socket to validate
   * @param jwtService The JwtService instance to use to validate the token
   *
   * @returns true if the socket is authenticated, false otherwise
   */
  static validateSocketToken(client: AuthedSocket, jwtService: JwtService): boolean {
    const auth = client.handshake?.auth?.token;
    const authHeaders = client.handshake?.headers?.authorization;

    const validateToken = (token: string): boolean => {
      try {
        const payload = jwtService.verify(token);
        client.userId = payload.userId;
        return true;
      } catch (e) {
        return false;
      }
    }

    if (auth) {
      if (validateToken(auth)) return true;
    }
    if (authHeaders) {
      if (validateToken(authHeaders)) return true;
    }
    return false;
  }
}