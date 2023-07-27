import jwt_decode from "jwt-decode";
import { JwtPayload } from "../type/client.type";

export function getToken(): string | null {
  console.log("GET TOKEN: ", localStorage.getItem("token"));
  return localStorage.getItem("token");
}

export function getPayload(): JwtPayload | null {
  const token = localStorage.getItem("token");
  console.log("GET TOKEN: ", token);
  if (!token) return null;
  return jwt_decode(token);
}
