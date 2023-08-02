import { TokenData } from "../type/jwt.type";

export namespace TypeCheckers {
  export function isTokenData(payload: any): payload is TokenData {
    return payload
      && typeof payload === "object"
      && "id" in payload && typeof payload.id === "number"
      && "email" in payload && typeof payload.email === "string"
      && "nickname" in payload && typeof payload.nickname === "string";
  }
}
