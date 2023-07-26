import { io, Socket } from "socket.io-client";
export namespace SocketManager {

  export type SocketParameters = {
    reconnection: boolean;
    reconnectionAttempts: number;
    reconnectionDelay: number;
    timeout: number;
    auth: { token: string } | {};
    path: string;
  };

  export type ManagedSocket = Socket & {
    isConnected: boolean;
    isConnecting: boolean;
    needsToConnect: () => boolean;
  };

  export function configureSocket(endpoint: string, parameters: SocketParameters): ManagedSocket {

    const sock = io(endpoint, parameters);
    const socket: ManagedSocket = Object.assign(
      sock,
      {isConnected: false, isConnecting: false, needsToConnect: () => (!socket.isConnected && !socket.isConnecting) });

    socket.isConnecting = true;

    console.log(sock);
    console.log(socket);

    socket.on("connect_error", (err) => {
      console.log("connexion error due to : ", err.message);
      socket.isConnecting = false;
      socket.isConnected = false;
    });

    socket.on("connect", () => {
      console.log("connected to matchmaking server");
      socket.isConnecting = false;
      socket.isConnected = true;
    });

    socket.on("disconnect", () => {
      console.log("disconnected from matchmaking server");
      socket.isConnecting = false;
      socket.isConnected = false;
    });

    socket.on("reconnect", () => {
      console.log("reconnected to matchmaking server");
      socket.isConnecting = false;
      socket.isConnected = true;
    });

    socket.on("reconnecting", () => {
      socket.isConnecting = true;
    });

    socket.on("reconnect_failed", () => {
      socket.isConnecting = false;
      socket.isConnected = false;
    });

    return socket;
  }
}