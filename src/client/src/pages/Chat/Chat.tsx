import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import "./Chat.css";
import { ChatInterface } from "./chat.interface";
import MyChannelList from "./MyChannelList";

const defaultChannelGen: string = "#general";
const channelList: string[] = [];
const chatList: Map<number, ChatInterface> = new Map();
let index: number = 0;

function inMyChannel(channel: string) {
  for (let index = 0; index < channelList.length; index++) {
    if (channelList[index] === channel)
      return true;
  }
  return false;
}

function MyChatMap() {
  let activeChannel = 'general';
  let canal = document.getElementById('canal');
  if (canal)
    activeChannel = canal.innerHTML;
  const filteredElements = Array.from(chatList).map(([key, rcv]) => {
    if (rcv.channel === activeChannel) {
      return (
          <li className={rcv.user} key={key}>
            <div className="contain-emt">{rcv.user}</div>
            <div className="contain-msg">{rcv.message}</div>
          </li>
      );
    }
    return null;
  });
  return <ul className="list-msg-container">{filteredElements}</ul>;
}

export default function ChatClient() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [recvMess, setRecvMess] = useState('');
  const [roomChange, setRoomChange] = useState('');
  const socketRef = useRef<any>(null);

  useEffect(() => {
    let newSocket = io('http://localhost:5400');
    socketRef.current = newSocket;

    newSocket.on('connect', () => {
      for (let index = 0; index < channelList.length; index++)
        if (channelList[index] === defaultChannelGen)
          return;
      newSocket.emit('join', defaultChannelGen);
    });

    newSocket.on('disconnect', (reason: string) => {
      // console.log(`Disconnected from server: ${reason}`);
    });

    newSocket.on('join', (room: string) => {
      console.log(`JOIN ${room}`);
      for (let index = 0; index < channelList.length; index++)
        if (channelList[index] === room)
          return;
      channelList.push(room);
      setRoomChange(room);
    });

    newSocket.on('rcv', (data: { msg: string, channel: string }) => {
      console.log(`RCV: ${data.msg}, socket ${data.channel}`);
      setRecvMess(data.msg);
      if (!inMyChannel(data.channel))
        return;
      if (!activeChannel(data.channel))
        return;
      const rcv = { user: "Rcv", channel: data.channel, message: data.msg };
      console.log(`data mess ${data.msg}`);
      chatList.set(index, rcv);
      index++;
    });

    newSocket.connect();

    return () => {
      newSocket.disconnect();
    };
  }, [recvMess, roomChange]);

  const sendMessage = () => {
    if (!inputRef.current || !inputRef.current.value || inputRef.current.value === '') return;
    if (socketRef.current) {
      const cmd = choiceCmd(inputRef.current.value);
      doCmd(cmd, inputRef.current.value);
      inputRef.current.value = '';
    }
  };

  function choiceCmd(input: string): string {
    if (input.indexOf("/") === 0) {
      return (input.substring(0, input.indexOf(" ")));
    }
    return ("/msg");
  }

  function doCmd(cmd: string, msg: string) {
    console.log(`${cmd}`);
    if (cmd === "/join") {
      if (msg.indexOf("#") === -1)
        return;
      const channel = takeChannelInMessage(msg);
      socketRef.current.emit('join', channel);
      let canal = document.getElementById('canal');
      // @ts-ignore
      canal.innerHTML = channel;
    } else {
      const channel = takeActiveCanal();
      msg = channel + " %" + msg;
      console.log(`Send normal message: ${msg}`);
      socketRef.current.emit('send :', msg);
      msg = takeMess(msg);
      const rcv = { user: "Emt", channel: channel, message: msg };
      chatList.set(index, rcv);
      setRecvMess(msg);
      index++;
    }
  }

  function takeMess(mess: string): string {
    return (mess.substring(mess.indexOf('%') + 1));
  }

  function takeActiveCanal(): string {
    let canal = document.getElementById('canal');
    // @ts-ignore
    return canal.innerHTML;
  }

  function activeChannel(channel: string) {
    let ele = document.getElementById('canal');
    // @ts-ignore
    let actChan = ele.innerHTML;
    return (actChan === channel);
  }

  function takeChannelInMessage(msg: string): string {
    let channelToJoin = msg.substring(msg.indexOf("#"));
    if (channelToJoin.indexOf(' ') !== -1)
      channelToJoin = channelToJoin.substring(channelToJoin.indexOf(' '));
    return channelToJoin;
  }

  function handleStringChange(newString: string) {
    setRoomChange(newString);
  }

  return (
      <div className='chat'>
        <h1>Chat</h1>
        <div className='chat-container'>
          <MyChannelList channelList={channelList} onStringChange={handleStringChange} />
          <h3 id='canal'>{defaultChannelGen}</h3>
          <div className="rcv-mess-container">
            <MyChatMap />
          </div>
          <div className='send-mess-container'>
            <input ref={inputRef} type="text" />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      </div>
  );
}
