import { io, Socket } from "socket.io-client";
import jwt_decode from "jwt-decode";
import { Decoded } from "../../type/client.type";

let socket: Socket;
let playerId: string;

function checkConnection() {

  if (socket && socket.connected)
    return;

  const token = localStorage.getItem("token");

  if (token) {
    try {
      const decoded: Decoded = jwt_decode(token)
      playerId = decoded.id;
    } catch (e) {
      return ;
    }
  } else {
    return;
  }

  const socketOptions = {
    reconnection: true,
    reconnectionAttempts: 3,
    reconnectionDelay: 3000,
    timeout: 10000,
    auth: token ? {token} : {},
    path: '/matchmaking',
  };

  const endpoint: string = "ws://localhost:5400";

  socket = io(endpoint, socketOptions);

  socket.on("connect_error", (err) => {
    console.log('connexion error due to : ', err.message);
  });

  socket.on("connect", () => {
    console.log("connected to matchmaking server");
  });

  socket.on("disconnect", () => {
    console.log("disconnected from matchmaking server");
  });
}

function disconnectFromGameServer() {
  if (socket && socket.connected)
    socket.disconnect();
}

export function joinMatchmakingCasual() {
  checkConnection();
  socket.emit("join-matchmaking-casual", {playerId: playerId});
}

export function leaveMatchmakingCasual() {
  checkConnection();
  socket.emit("leave-matchmaking-casual", {playerId: playerId});
}

export function joinMatchmakingRanked() {
  checkConnection();
  socket.emit("join-matchmaking-ranked", {playerId: playerId});
}

export function leaveMatchmakingRanked() {
  checkConnection();
  socket.emit("leave-matchmaking-ranked", {playerId: playerId});
}
