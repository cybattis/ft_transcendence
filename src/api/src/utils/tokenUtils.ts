import { ForbiddenException } from "@nestjs/common";
import {TokenData} from "../type/jwt.type";
import {JwtService} from "@nestjs/jwt";
import {TypeCheckers} from "./type-checkers";

export function getTokenOrThrow(header: Headers): string {
  if (header === undefined)
    throw new ForbiddenException('Invalid token');
  const str = header.toString();
  if (str.startsWith('Bearer '))
    return str.slice(7);
  else
    throw new ForbiddenException('Invalid token');
}

export function decodeTokenOrThrow(header: Headers, jwtService: JwtService): TokenData {
  const token = getTokenOrThrow(header);
  const decoded = jwtService.decode(token);
  if (TypeCheckers.isTokenData(decoded))
    return decoded;
  else
    throw new ForbiddenException('Invalid token');
}