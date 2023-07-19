import { io, Socket } from "socket.io-client";
import { apiBaseURL } from "../../utils/constant";

export type newMessagesCallBack = {
  (data: { sender: string, msg: string, channel: string, blockedChat: any }): void;
}

export type newChannelCallBack = {
  (room :string): void;
}

export type newQuitCallBack = {
  (room :string): void;
}

export type newBlockedCallBack = {
  (target: string): void;
}

export type newInvCallBack = {
  (data: {username: string, target: string}): void;
}

export namespace ChatClientSocket {

  let socket: Socket;
  let newMessageCallBack: newMessagesCallBack[] = [];
  let newJoinChannel: newChannelCallBack[] = [];
  let newBlockedCallBack: newBlockedCallBack[] = [];
  let newQuitCallBack: newQuitCallBack[] = [];
  let newInvCallBack: newInvCallBack[] = [];

  function checkChatConnection(): boolean {

    if (socket && socket.connected)
      return true;

    console.log("connecting to server");

    const token = localStorage.getItem("token");

    const socketOptions = {
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 3000,
      timeout: 10000,
      auth: token ? {token} : {},
    };

    socket = io(apiBaseURL, socketOptions);

    socket.on("connect", () => {
      console.log("connected on chat server.")
    });

    socket.on("disconnect", () => {
      console.log("disconnected from chat server.");
    });

    socket.on("join", (room: string) => {
      console.log(room, " joined.");
      newJoinChannel.forEach(callback => callback(room));
    });

    socket.on('rcv', (data: { sender: string, msg: string, channel: string, blockedChat: any }) => {
      newMessageCallBack.forEach(callback => callback(data));
    });

    socket.on('blocked', (target: string) => {
      newBlockedCallBack.forEach(callback => callback(target));
    });
    
    socket.on('quit', (room: string) => {
      newQuitCallBack.forEach(callback => callback(room));
    });

    socket.on('inv', (data: { username: string; target: string }) => {
      newInvCallBack.forEach(callback => callback(data));
    });

    return true;
  }

  function disconnect() {
    if (socket && socket.connected)
      socket.disconnect();
  }

  export function onPm(sendPrv: {username: string, target: string}) {
    if (!checkChatConnection()) return;
    socket.emit("prv", sendPrv);
  }

  export function onOp(message: {op: string, channel: string, author: string, cmd: string, target: string}) {
    if (!checkChatConnection()) return;
    socket.emit("op", message);
  }

  export function onKick(sendKick: {cmd: string, username: string, target: string, channel: string}) {
    if (!checkChatConnection()) return;
    socket.emit("kick", sendKick);
  }

  export function onBan(sendBan: {cmd: string, username: string, target: string, channel: string, time: string}) {
    if (!checkChatConnection()) return;
    socket.emit("ban", sendBan);
  }

  export function onQuit(sendQuit: {cmd: string, username: string, channel: string}) {
    if (!checkChatConnection()) return;
    socket.emit("quit", sendQuit);
  }

  export function joinChatServer(res: any) {
    if (!checkChatConnection()) return;
    socket.emit("join", res);
  }

  export function onInfo(channel: string) {
    if (!checkChatConnection()) return;
    socket.emit("info", { channel });
  }

  export function onJoin(sendJoin: {username: string, channel: string, password: string, type: string}) {
    if (!checkChatConnection()) return;
    console.log(`Join ${sendJoin.username} ${sendJoin.channel} ${sendJoin.password}`);
    socket.emit("join", sendJoin);
  }

  export function onBlocked(sendBlock: any) {
    if (!checkChatConnection()) return;
    socket.emit("blocked", sendBlock);
  }

  export function onCmd(channel: string) {
    if (!checkChatConnection()) return;
    socket.emit("cmd", { channel });
  }

  export function onSend(send: {username: string, channel: string, msg: string}) {
    if (!checkChatConnection()) return;
    if (!send.msg || !send.msg[0]) return ;
    socket.emit("send :", send);
  }

  export function onMessageRecieve(callback: newMessagesCallBack) {
    newMessageCallBack.push(callback);
  }

  export function onJoinChan(callback: newChannelCallBack) {
    newJoinChannel.push(callback);
  }

  export function addBlockCb(callback: newBlockedCallBack) {
    newBlockedCallBack.push(callback);
  }

  export function addQuitCb(callback: newQuitCallBack) {
    newQuitCallBack.push(callback);
  }

  export function addInvCb(callback: newInvCallBack) {
    newInvCallBack.push(callback);
  }

  export function offMessageRecieve(callback: newMessagesCallBack) {
    newMessageCallBack = newMessageCallBack.filter((cb) => cb !== callback);
  }

  export function offJoinChan(callback: newChannelCallBack) {
    newJoinChannel = newJoinChannel.filter((cb) => cb !== callback);
  }

  export function offBlock(callback: newBlockedCallBack) {
    newBlockedCallBack = newBlockedCallBack.filter((cb) => cb !== callback);
  }

  export function offQuit(callback: newQuitCallBack) {
    newQuitCallBack = newQuitCallBack.filter((cb) => cb !== callback);
  }

  export function offInv(callback: newInvCallBack) {
    newInvCallBack = newInvCallBack.filter((cb) => cb !== callback);
  }
}