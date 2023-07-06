import { io, Socket } from "socket.io-client";
import { apiBaseURL } from "../../utils/constant";

export type newMessagesCallBack = {
  (data: { sender: string, msg: string, channel: string }): void;
}

export type newChannelCallBack = {
  (room :string): void;
}

export namespace ChatClientSocket {

  let socket: Socket;
  let newMessageCallBack: newMessagesCallBack[] = [];
  let newJoinChannel: newChannelCallBack[] = [];

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
    });

    socket.on('rcv', (data: { sender: string, msg: string, channel: string }) => {
      newMessageCallBack.forEach(callback => callback(data));
    });

    return true;
  }

  function disconnect() {
    if (socket && socket.connected)
      socket.disconnect();
  }

  export function joinChatServer(res: any) {
    if (!checkChatConnection()) return;
    socket.emit("join", res);
  }

  export function onInfo(channel: string) {
    if (!checkChatConnection()) return;
    socket.emit("info", { channel });
  }

  export function onCmd(channel: string) {
    if (!checkChatConnection()) return;
    socket.emit("cmd", { channel });
  }

  export function onSend(send: {username: string, channel: string, msg: string}) {
    if (!checkChatConnection()) return;
    socket.emit("send :", send);
  }

  export function onMessageRecieve(callback: any) {
    newMessageCallBack.push(callback);
  }

  export function onJoinChan(callback: any) {
    newJoinChannel.push(callback);
  }
}

/*

    newSocket.on("blocked", (target: string) => {
      blocedList.push(target);
    });

    newSocket.on("quit", (room: string) => {
      for (let index = 0; index < channelList.length; index++) {
        console.log(channelList[index]);
        if (room === channelList[index]) {
          channelList.splice(index, 1);
          const canal = document.getElementById("canal");
          if (canal) {
            canal.innerHTML = defaultChannelGen;
            setRoomChange(defaultChannelGen);
          }
          return;
        }
      }
    });

    socketRef.current.on(
      "friendRequest",
      (data: { friend: any; from: string }) => {
        setNotif(true);
      }
    );

    newSocket.on("inv", (data: { username: string; target: string }) => {
      if (data.target === username) {
        if (!channelList.includes(data.username)) {
          channelList.push(data.username);
          setRoomChange(data.username);
          const canal = document.getElementById("canal");
          if (canal) canal.innerHTML = data.username;
        }
      }
      if (data.username === username) {
        if (!channelList.includes(data.target)) {
          channelList.push(data.target);
          setRoomChange(data.target);
          const canal = document.getElementById("canal");
          if (canal) canal.innerHTML = data.target;
        }
      }
    };*/