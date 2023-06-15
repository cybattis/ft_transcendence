import React, {useEffect, useRef, useState} from 'react';
import {io} from 'socket.io-client';
import "./Chat.css";
import {ChatInterface} from "./chat.interface";
import MyChannelList from "./MyChannelList";
import {Decoded} from "../../type/client.type";
import jwt_decode from "jwt-decode";
import DoActionChannel from "./DoActionChannel";


const defaultChannelGen: string = "#general";
const channelList: string[] = [];
const chatList: ChatInterface[] = [];
let username = '';
function inMyChannel(channel: string) {
  return channelList.includes(channel);
}

function MyChatMap() {
  const activeChannel = document.getElementById('canal')?.innerHTML || '';
  const filteredElements = chatList
      .filter((rcv) => rcv.channel === activeChannel)
      .map((rcv, key) => (
          <li className={rcv.event} key={key}>
            <div className="contain-emt">{rcv.username}</div>
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
  if (username === '') {
    try {
      decoded = jwt_decode(localStorage.getItem("token")!);
      console.log(`Decode ${decoded?.id}`);
      console.log(`Decode ${decoded?.username}`);
      if (decoded?.username)
        username = decoded.username;
    } catch (e) {
      console.log(`Decode error ${e}`);
    }
  }
  useEffect(() => {
    const newSocket = io('http://localhost:5400');
    socketRef.current = newSocket;

    newSocket.on('connect', () => {
      if (!channelList.includes(defaultChannelGen)) {
        const send = {username: username, channel: defaultChannelGen};
        newSocket.emit('join', send);
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
        const canal = document.getElementById('canal');
        if (canal)
          canal.innerHTML = room;
      }
    });

    newSocket.on('quit', (room: string) => {
      console.log(`quit ${room}`);
      //do quit channel and change room
      for (let index = 0; index < channelList.length; index++){
        console.log(channelList[index]);
        if (room === channelList[index])
        {
          channelList.splice(index, 1);
          const canal = document.getElementById('canal');
          if (canal) {
            canal.innerHTML = defaultChannelGen;
            setRoomChange(defaultChannelGen);
          }
          return ;
        }
      }

    });

    newSocket.on('inv', (data: {username: string, target: string}) =>{
      console.log("Invite to private message");
      if (data.target === username) {
        if (!channelList.includes(data.username)) {
          channelList.push(data.username);
          setRoomChange(data.username);
          const canal = document.getElementById('canal');
          if (canal)
            canal.innerHTML = data.username;
        }
      }
      if (data.username === username) {
        if (!channelList.includes(data.target)) {
          channelList.push(data.target);
          setRoomChange(data.target);
          const canal = document.getElementById('canal');
          if (canal)
            canal.innerHTML = data.target;
        }
      }
    });

    newSocket.on('rcv', (data: { sender: string, msg: string, channel: string }) => {
      console.log(`RCV: ${data.msg}, socket ${data.channel}`);
      setRecvMess(data.msg);
      if (!inMyChannel(data.channel)){
        return;
      }
      const rcv: ChatInterface = { event:"Rcv", username: data.sender, channel: data.channel, message: data.msg };
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
    const channel = takeActiveCanal();
    if (cmd === "/join")
      join(msg);
    else if (cmd === "/op")
      op(msg, channel);
    else if (cmd === "/ban")
      ban(msg, channel);
    else if (cmd === "/info")
      socketRef.current.emit('info', {channel});
    else if (cmd === "/cmd") {
      socketRef.current.emit('cmd', {channel});
    } else if (cmd === "/kick") {
      kick(msg, channel)
    } else if (cmd === "/quit") {
      quit(channel);
    } else if (cmd === "/pass") {
      pass(msg, channel);
    }else {
      const send = {username: username, channel: channel, msg: msg}
      console.log(send);
      socketRef.current.emit('send :', send);
      msg = takeMess(msg);
      const rcv: ChatInterface = { event: "Emt", username: username, channel: channel, message: msg };
      chatList.push(rcv);
      setRecvMess(msg);
    }
  }

  function quit(channel: string){
    const cmd = "quit";
    const sendQuit = {msg: "Cmd quit sen", cmd: cmd, username: username, channel: channel}
    socketRef.current.emit('quit', sendQuit);
  }

  function pass(msg: string, channel: string){
    console.log(`pass ${msg}`);
    const sendPass = {pass: "pass", channel: channel, username: username}
    socketRef.current.emit('pass', sendPass);
  }
  function kick(msg: string, channel: string) {
    const cmd = "kick";
    const target = takeTarget(msg);
    const sendKick = {cmd: cmd, username: username, target: target, channel: channel}
    socketRef.current.emit('kick', sendKick);
  }
  function ban(msg: string, channel: string){
    const cmd = takeOperation(msg);
    const target = takeTarget(msg);
    const time = takeTime(msg);
    const sendBan = {cmd: cmd, username: username, target: target, channel: channel, time: time}
    socketRef.current.emit('ban', sendBan);
  }
  function join(msg : string){
    if (msg.indexOf("#") === -1) {
      return;
    }
    const channelJoin = takeChannelInMessage(msg);
    const sendJoin = {username: username, channel: channelJoin}
    socketRef.current.emit('join', sendJoin);
  }

  const CommandByForm = (data : any) => {
    console.log("Valeur du formulaire :", data);
    if (data.target){
      const sendPrv = {username: username, target: data.target};
      socketRef.current.emit('prv', sendPrv);
    }
    const sendJoin = {username: username, channel: data.channel, password: data.password}
    socketRef.current.emit('join', sendJoin);
  };
  function op(msg: string, channel: string){
    const author: string = username;
    const target: string = takeTarget(msg);
    const cmd: string = takeOperation(msg);
    const message = {op : "op", channel : channel, author: author, cmd: cmd, target: target};
    socketRef.current.emit('op', message);
  }
  function takeMess(mess: string): string {
    return mess.substring(mess.indexOf('%') + 1);
  }

  function takeActiveCanal(): string {
    const canal = document.getElementById('canal');
    return canal?.innerHTML || '';
  }

  function takeTarget(msg: string): string {
    let res = msg.substring(msg.indexOf(' ') + 1);
    res = res.substring(res.indexOf(' ') + 1);
    if (res.indexOf(' ') !== -1)
      return res.substring(0, res.indexOf(' '));
    return res;
  }

  function takeTime(msg: string){
    const time = msg.substring(msg.lastIndexOf(' ') + 1);
    console.log(`time ${time}`);
    return time;
  }

  function  takeOperation(msg: string): string {
    let op;
    if (msg.indexOf('+') !== -1){
      op = msg.substring(msg.indexOf('+'));
      op = op.substring(0, op.indexOf(' '));
    }
    else if (msg.indexOf('-') !== -1){
      op = msg.substring(msg.indexOf('-'));
      op = op.substring(0, op.indexOf(' '));
    }
    else
      op = ''
    return op;
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
        <h1>Chat</h1>
        <div className='chat-container'>
          <DoActionChannel onSubmit={CommandByForm}/>
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
