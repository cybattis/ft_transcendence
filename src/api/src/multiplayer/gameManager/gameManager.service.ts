import { Injectable } from "@nestjs/common";
import { Server } from "socket.io";

@Injectable()
export class MultiplayerService {
  private server: Server;

}