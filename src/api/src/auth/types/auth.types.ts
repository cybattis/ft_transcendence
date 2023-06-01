import { Socket } from "socket.io";

export type AuthedSocket = Socket & { userId: number };