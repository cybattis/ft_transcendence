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

  export function configureSocket(
    endpoint: string,
    parameters: SocketParameters
  ): ManagedSocket {
    const sock = io(endpoint, parameters);
    const socket: ManagedSocket = Object.assign(sock, {
      isConnected: false,
      isConnecting: false,
      needsToConnect: () => !socket.isConnected && !socket.isConnecting,
    });

    socket.isConnecting = true;

    socket.on("connect_error", (err) => {
      socket.isConnecting = false;
      socket.isConnected = false;
    });

    socket.on("connect", () => {
      socket.isConnecting = false;
      socket.isConnected = true;
    });

    socket.on("disconnect", () => {
      socket.isConnecting = false;
      socket.isConnected = false;
    });

    socket.on("reconnect", () => {
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
