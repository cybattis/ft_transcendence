import { wsBaseURL } from "../../utils/constant";
import { SocketManager } from "../../utils/socketManager";

export type newMessagesCallBack = {
  (data: {
    sender: string;
    msg: string;
    channel: string;
    blockedChat: any;
  }): void;
};

export type newGameMessageCallBack = {
  (data: {
    sender: string,
    content: string
  }): void;
};

export type newChannelCallBack = {
  (room: string): void;
};

export type newQuitCallBack = {
  (room: string): void;
};

export type newBlockedCallBack = {
  (target: string): void;
};

export type newInvCallBack = {
  (data: { username: string; target: string }): void;
};

export type notificationEventCallback = {
  (): void;
};

export type newUsername = {
  (newName: string): void;
};

export type newErrCallBack = {
  (data: { channel: string; reason: string }): void;
};

export namespace ChatClientSocket {
  import SocketParameters = SocketManager.SocketParameters;
  import ManagedSocket = SocketManager.ManagedSocket;
  let socket: ManagedSocket;
  let newMessageCallBack: newMessagesCallBack[] = [];
  let newGameMessageCallBack: newGameMessageCallBack[] = [];
  let newJoinChannel: newChannelCallBack[] = [];
  let newBlockedCallBack: newBlockedCallBack[] = [];
  let newQuitCallBack: newQuitCallBack[] = [];
  let newInvCallBack: newInvCallBack[] = [];
  let notificationEventCallbacks: notificationEventCallback[] = [];
  let changesCallBack: newUsername[] = [];
  let newErrCallBack: newErrCallBack[] = [];

  export function checkChatConnection(): boolean {
    if (socket && !socket.needsToConnect()) return true;
    return connect();
  }

  export function connect(): boolean {
    if (socket && !socket.needsToConnect()) return true;

    const token = localStorage.getItem("token");

    const socketOptions: SocketParameters = {
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 3000,
      timeout: 10000,
      auth: token ? { token } : {},
      path: "/chat",
    };

    socket = SocketManager.configureSocket(wsBaseURL, socketOptions);

    socket.on("join", (room: string) => {
      newJoinChannel.forEach((callback) => callback(room));
    });

    socket.on(
      "rcv",
      (data: {
        sender: string;
        msg: string;
        channel: string;
        blockedChat: any;
      }) => {
        newMessageCallBack.forEach((callback) => callback(data));
      }
    );

    socket.on(
      "rcvgame",
      (data: {
        sender: string;
        content: string;
      }) => {
        newGameMessageCallBack.forEach((callback) => callback(data));
      }
    );

    socket.on("blocked", (target: string) => {
      newBlockedCallBack.forEach((callback) => callback(target));
    });

    socket.on("quit", (room: string) => {
      newQuitCallBack.forEach((callback) => callback(room));
    });

    socket.on("inv", (data: { username: string; target: string }) => {
      newInvCallBack.forEach((callback) => callback(data));
    });

    socket.on("notification", () => {
      notificationEventCallbacks.forEach((callback) => callback());
    });

    socket.on("err", (data: { channel: string; reason: string }) => {
      newErrCallBack.forEach((callback) => callback(data));
    });

    socket.on("change-username", (newName: string) => {
      changesCallBack.forEach((callback) => callback(newName));
    });

    return true;
  }

  export function disconnect() {
    if (socket && socket.connected) socket.disconnect();
  }

  export function privateMessage(sendPrv: {
    username: string;
    target: string;
  }) {
    if (!checkChatConnection()) return;
    socket.emit("prv", sendPrv);
  }

  export function inviteToChannel(sendInv: {
    channel: string;
    target: string;
  }) {
    if (!checkChatConnection()) return;
    socket.emit("inv", sendInv);
  }

  export function operator(message: {
    op: string;
    channel: string;
    author: string;
    cmd: string;
    target: string;
  }) {
    if (!checkChatConnection()) return;
    socket.emit("op", message);
  }

  export function kick(sendKick: {
    cmd: string;
    username: string;
    target: string;
    channel: string;
  }) {
    if (!checkChatConnection()) return;
    socket.emit("kick", sendKick);
  }

  export function ban(sendBan: {
    cmd: string;
    username: string;
    target: string;
    channel: string;
    time: string;
  }) {
    if (!checkChatConnection()) return;
    socket.emit("ban", sendBan);
  }

  export function unBan(sendBan: {
    cmd: string;
    username: string;
    target: string;
    channel: string;
  }) {
    if (!checkChatConnection()) return;
    socket.emit("unban", sendBan);
  }

  export function mute(sendMute: {
    cmd: string;
    //time: string;
    username: string;
    target: string;
    channel: string;
  }) {
    if (!checkChatConnection()) return;
    socket.emit("mute", sendMute);
  }

  export function unMute(sendMute: {
    cmd: string;
    username: string;
    target: string;
    channel: string;
  }) {
    if (!checkChatConnection()) return;
    socket.emit("unmute", sendMute);
  }

  export function quit(sendQuit: {
    cmd: string;
    username: string;
    channel: string;
  }) {
    if (!checkChatConnection()) return;
    socket.emit("quit", sendQuit);
  }

  export function joinChatServer(res: any) {
    if (!checkChatConnection()) return;
    socket.emit("join", res);
  }

  export function joinChannel(sendJoin: {
    username: string;
    channel: string;
    password: string;
    type: string;
  }) {
    if (!checkChatConnection()) return;
    socket.emit("join", sendJoin);
  }

  export function updateChannel(sendChange: {
    channel: string;
    type: string;
    pwd: string;
    username: string;
  }) {
    if (!checkChatConnection()) return;
    socket.emit("change", sendChange);
  }

  export function blocked(sendBlock: any) {
    if (!checkChatConnection()) return;
    socket.emit("blocked", sendBlock);
  }

  export function commande(channel: string) {
    if (!checkChatConnection()) return;
    socket.emit("cmd", { channel });
  }

  export function send(send: {
    username: string;
    channel: string;
    msg: string;
  }) {
    if (!checkChatConnection()) return;
    if (!send.msg || !send.msg[0]) return;
    socket.emit("send", send);
  }

  export function notificationEvent(target: number) {
    if (!checkChatConnection()) return;
    socket.emit("notif-event", target);
  }

  export function changedUsername(newName: string) {
    if (!checkChatConnection()) return;
    socket.emit("change-username", newName);
  }

  export function AcceptInvitationChannel(data: {
    channel: string;
    targetID: number;
  }) {
    if (!checkChatConnection()) return;
    socket.emit("acc", data);
  }

  export function sendGameChat(send: {
    gameId: number,
    sender: string,
    content: string,
  }) {
    if (!checkChatConnection()) return;
    if (!send.content || !send.content[0]) return;
    socket.emit("sendGame", send);
  }

  export function joinGameChat(gameId: number ) {
    if (!checkChatConnection()) return;
    socket.emit("joinGame", gameId);
  }

  export function leaveGameChat(gameId: number ) {
    if (!checkChatConnection()) return;
    socket.emit("leaveGame", gameId);
  }

  // Callbacks
  // ========================================================================
  export function onMessageRecieve(callback: newMessagesCallBack) {
    newMessageCallBack.push(callback);
  }

  export function onGameMessageRecieve(callback: newGameMessageCallBack) {
    newGameMessageCallBack.push(callback);
  }

  export function onChangeUsername(callback: newUsername) {
    changesCallBack.push(callback);
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

  export function addErr(callback: newErrCallBack) {
    newErrCallBack.push(callback);
  }

  export function offMessageRecieve(callback: newMessagesCallBack) {
    newMessageCallBack = newMessageCallBack.filter((cb) => cb !== callback);
  }

  export function offGameMessageRecieve(callback: newGameMessageCallBack) {
    newGameMessageCallBack = newGameMessageCallBack.filter(
      (cb) => cb !== callback
    );
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

  export function offChange(callback: newUsername) {
    changesCallBack = changesCallBack.filter(
      (cb) => cb !== callback
    );
  }

  export function offErr(callback: newErrCallBack) {
    newErrCallBack = newErrCallBack.filter((cb) => cb !== callback);
  }

  export function onNotificationEvent(callback: notificationEventCallback) {
    notificationEventCallbacks.push(callback);
  }

  export function offNotificationEvent(callback: notificationEventCallback) {
    notificationEventCallbacks = notificationEventCallbacks.filter(
      (cb) => cb !== callback
    );
  }
}
