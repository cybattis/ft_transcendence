import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import "./Chat.css";
import { ChatInterface } from "./chat.interface";
import MyChannelList from "./MyChannelList";
import ListUsersChannel from "./ListUsersChannel";
import {Decoded} from "../../type/client.type";
import jwt_decode from "jwt-decode";
import { UserInfo } from "../../type/user.type";



const defaultChannelGen: string = "#general";
const channelList: string[] = [];
const chatList: ChatInterface[] = [];
let index: number = 0;

function inMyChannel(channel: string) {
  return channelList.includes(channel);
}

function MyChatMap() {
  const activeChannel = document.getElementById('canal')?.innerHTML || '';
  const filteredElements = chatList
      .filter((rcv) => rcv.channel === activeChannel)
      .map((rcv, key) => (
          <li className={rcv.user} key={key}>
            <div className="contain-emt">{rcv.user}</div>
            <div className="contain-msg">{rcv.message}</div>
          </li>
      ));
  return <ul className="list-msg-container">{filteredElements}</ul>;
}

export default function ChatClient() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [recvMess, setRecvMess] = useState('');
  const [roomChange, setRoomChange] = useState('');
  const socketRef = useRef<any>(null);

  let decoded: Decoded | null = null;

  try {
    decoded = jwt_decode(localStorage.getItem("token")!);
    console.log(`Decode ${decoded?.id}`);
  } catch (e) {
    console.log(`Decode error ${e}`);
  }

  fetchData(decoded?.id)
  async function fetchData(id: string) {
    await axios
        .get(`http://localhost:5400/user/profile/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })
        .then((response) => {
          user : UserInfo = response.data;
        });
    return user;
  }

  useEffect(() => {
    const newSocket = io('http://localhost:5400');
    socketRef.current = newSocket;

    newSocket.on('connect', () => {
      if (!channelList.includes(defaultChannelGen)) {
        newSocket.emit('join', defaultChannelGen);
      }
    });

    newSocket.on('disconnect', (reason: string) => {
      // console.log(`Disconnected from server: ${reason}`);
    });

    newSocket.on('join', (room: string) => {
      console.log(`JOIN ${room}`);
      if (!channelList.includes(room)) {
        channelList.push(room);
        setRoomChange(room);
      }
    });

    newSocket.on('rcv', (data: { msg: string, channel: string }) => {
      console.log(`RCV: ${data.msg}, socket ${data.channel}`);
      setRecvMess(data.msg);
      if (!inMyChannel(data.channel)){
        return;
      }
      const rcv: ChatInterface = { user: "Rcv", channel: data.channel, message: data.msg };
      console.log(`data mess ${data.msg}`);
      chatList.push(rcv);
    });

    newSocket.connect();

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const sendMessage = () => {
    if (!inputRef.current || !inputRef.current.value || inputRef.current.value === '') {
      return;
    }
    if (socketRef.current) {
      const cmd = choiceCmd(inputRef.current.value);
      doCmd(cmd, inputRef.current.value);
      inputRef.current.value = '';
    }
  };

  function choiceCmd(input: string): string {
    if (input.indexOf("/") === 0) {
      return input.substring(0, input.indexOf(" "));
    }
    return "/msg";
  }

  function doCmd(cmd: string, msg: string) {
    console.log(`${cmd}`);
    if (cmd === "/join") {
      if (msg.indexOf("#") === -1) {
        return;
      }
      const channel = takeChannelInMessage(msg);
      socketRef.current.emit('join', channel);
      const canal = document.getElementById('canal');
      if (canal) {
        canal.innerHTML = channel;
      }
    }
    else if (cmd === "/op"){
      const channel = takeActiveCanal();
      const author: string = "author";
      const target: string = "target";
      const cmd: string = "+o";
      const op: string = "op"
      const message = {op : op, channel : channel, author: author, cmd: cmd, target: target};
      socketRef.current.emit('op', message);
      console.log(`message op ${msg}`);
    } else if (cmd === "/info") {
      console.log(`message info ${msg}`);
      const channel = takeActiveCanal();
      console.log(`active ${channel}`);
      socketRef.current.emit('info', {channel});
    } else if (cmd === "/cmd") {
      console.log(`message cmd ${msg}`);
      const channel = takeActiveCanal();
      console.log(`active ${channel}`);
      socketRef.current.emit('cmd', {channel});
    } else {
      const channel = takeActiveCanal();
      msg = channel + " %" + msg;
      console.log(`Send normal message: ${msg}`);
      socketRef.current.emit('send :', msg);
      msg = takeMess(msg);
      const rcv: ChatInterface = { user: "Emt", channel: channel, message: msg };
      chatList.push(rcv);
      setRecvMess(msg);
    }
  }

  function takeMess(mess: string): string {
    return mess.substring(mess.indexOf('%') + 1);
  }

  function takeActiveCanal(): string {
    const canal = document.getElementById('canal');
    return canal?.innerHTML || '';
  }

  function activeChannel(channel: string) {
    const ele = document.getElementById('canal');
    const actChan = ele?.innerHTML || '';
    return actChan === channel;
  }

  function takeChannelInMessage(msg: string): string {
    let channelToJoin = msg.substring(msg.indexOf("#"));
    if (channelToJoin.indexOf(' ') !== -1) {
      channelToJoin = channelToJoin.substring(channelToJoin.indexOf(' '));
    }
    return channelToJoin;
  }

  function handleStringChange(newString: string) {
    setRoomChange(newString);
  }

  return (
      <div className='chat'>
        {/*<ListUsersChannel channel={roomChange} />*/}
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
