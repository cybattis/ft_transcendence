import React, { useEffect, useRef, useState, useContext } from "react";
import { io } from "socket.io-client";
import "./Chat.css";
import { ChatInterface } from "./Interface/chat.interface";
import ChannelList from "./List/ChannelList";
import { JwtPayload } from "../../type/client.type";
import jwt_decode from "jwt-decode";
import DoJoinChannel from "./ActionChannel/DoJoinChannel";
import DoPrivateMessage from "./ActionChannel/DoPrivateMessage";
import DoOperator from "./ActionChannel/DoOperator";
import DoBanChannel from "./ActionChannel/DoBanChannel";
import DoKickChannel from "./ActionChannel/DoKickChannel";
import DoQuitChannel from "./ActionChannel/DoQuitChannel";
import DoBlockUsers from "./ActionChannel/DoBlockUsers";
import { NotifContext } from '../../components/Auth/dto';
import { SocketContext } from '../../components/Auth/dto';
import { FormContext } from '../../components/Auth/dto';
import axios from "axios";


const defaultChannelGen: string = "#general";
const channelList: string[] = [];
let username = '';

function takeActiveCanal(): string {
  const canal = document.getElementById('canal');
  return canal?.innerHTML || '';
}

function ChatMap({post} : {post : ChatInterface[]}) {
  const { setChatForm } = useContext(FormContext);
  const filteredElements = post
    .filter((rcv: ChatInterface) => rcv.channel === takeActiveCanal())
    .map((rcv: ChatInterface, key: number) => (
    rcv.emitter === username ? (
      <li className="Emt" key={key}>
        <div className="contain-emt" onClick={() => { setChatForm(true) }}>{rcv.emitter}</div>
        <div className="contain-msg">{rcv.content}</div>
      </li>
    ) : (
      <li className="Rcv" key={key}>
        <div className="contain-emt" onClick={() => { setChatForm(true) }}>{rcv.emitter}</div>
        <div className="contain-msg">{rcv.content}</div>
      </li>
    )
  ));
  return <ul className="list-msg-container">{filteredElements}</ul>;
}

export default function ChatClient() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [recvMess, setRecvMess] = useState('');
  const [roomChange, setRoomChange] = useState('');
  const [post, setPost] = useState<ChatInterface[]>([]);
  const socketRef = useRef<any>(null);
  const blocedList: string[] = [];
  const { setNotif } = useContext(NotifContext);
  const { socketId, setSocketId } = useContext(SocketContext);

  let decoded: JwtPayload | null = null;
  if (username === "") {
    try {
      decoded = jwt_decode(localStorage.getItem("token")!);
      console.log(`Decode ${decoded?.id}`);
      console.log(`Decode ${decoded?.username}`);
      if (decoded?.username) username = decoded.username;
    } catch (e) {
      console.log(`Decode error ${e}`);
    }
  }

  const sendMessage = () => {
    if (
      !inputRef.current ||
      !inputRef.current.value ||
      inputRef.current.value === ""
    ) {
      return;
    }
    if (socketRef.current) {
      const cmd = choiceCmd(inputRef.current.value);
      doCmd(cmd, inputRef.current.value);
      inputRef.current.value = "";
    }
  };

  useEffect(() => {
    
    const newSocket = io("http://127.0.0.1:5400");
    socketRef.current = newSocket;
    if (socketId === null)
      setSocketId(newSocket.id);

    newSocket.on("connect", () => {
      if (!channelList.includes(defaultChannelGen)) {
        const send = { username: username, channel: defaultChannelGen };
        newSocket.emit("join", send);
        console.log("Connect");
      }
    });

    newSocket.on("disconnect", (reason: string) => {
      // console.log(`Disconnected from server: ${reason}`);
    });

    newSocket.on("join", (room: string) => {
      if (!channelList.includes(room)) {
        channelList.push(room);
        setRoomChange(room);
        const canal = document.getElementById("canal");
        if (canal) canal.innerHTML = room;
      }
    });

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
    });

    
    newSocket.on('rcv', (data: { sender: string, msg: string, channel: string }) => {
      if (senderIsBlocked(data.sender))
        return ;
      let addressInfo = "http://127.0.0.1:5400/chat/message/" + data.channel;
      axios.get(addressInfo)
        .then(response => {
          setPost(response.data);
        })
      setRecvMess(data.msg);
    });

    newSocket.connect();

    return () => {
      newSocket.disconnect();
    };
  }, [sendMessage, recvMess, handleStringChange]);

  function choiceCmd(input: string): string {
    if (input.indexOf("/") === 0) {
      if (input.indexOf(" ") !== -1)
        return input.substring(0, input.indexOf(" "));
      return input;
    }
    return "/msg";
  }

  function doCmd(cmd: string, msg: string) {
    const channel = takeActiveCanal();
    if (cmd === "/info") socketRef.current.emit("info", { channel });
    else if (cmd === "/cmd") {
      socketRef.current.emit("cmd", { channel });
    } else {
      const send = {username: username, channel: channel, msg: msg}
      socketRef.current.emit('send :', send);
      let addressInfo = "http://127.0.0.1:5400/chat/message/" + takeActiveCanal();
      axios.get(addressInfo)
        .then(response => {
          setPost(response.data);
        })
    }
  }

  function senderIsBlocked(sender: string) {
    for (let index = 0; index < blocedList.length; index++) {
      if (sender === blocedList[index]) return true;
    }
    return false;
  }

  const PrivateMessageForm = (target: string) => {
    const sendPrv = { username: username, target: target };
    socketRef.current.emit("prv", sendPrv);
    return;
  };

  const JoinByForm = (channel: string, password: string) => {
    if (channel.indexOf("#") === -1)
      channel = '#' + channel;
    let type = "public";
    if (password)
      type = "private"; 
    const sendJoin = {username: username, type: type, channel: channel, password: password};
    socketRef.current.emit('join', sendJoin);
  }
  
  const OperatorForm = (target: string, action: string) => {
    const author: string = username;
    const channel = takeActiveCanal();
    const message = {
      op: "op",
      channel: channel,
      author: author,
      cmd: action,
      target: target,
    };
    socketRef.current.emit("op", message);
  };

  const BanForm = (target: string, action: string, time: string) => {
    const channel = takeActiveCanal();
    const sendBan = {
      cmd: action,
      username: username,
      target: target,
      channel: channel,
      time: time,
    };
    socketRef.current.emit("ban", sendBan);
  };

  const KickForm = (target: string) => {
    const channel = takeActiveCanal();
    const sendKick = {
      cmd: "kick",
      username: username,
      target: target,
      channel: channel,
    };
    socketRef.current.emit("kick", sendKick);
  };

  const QuitForm = () => {
    const channel = takeActiveCanal();
    const sendQuit = { cmd: "quit", username: username, channel: channel };
    socketRef.current.emit("quit", sendQuit);
  };

  const BlockedForm = (target: string, cmd: string) => {
    const sendBlock = { target: target };
    socketRef.current.emit("blocked", sendBlock);
  };

  function takeMess(mess: string): string {
    return mess.substring(mess.indexOf("%") + 1);
  }

  function handleStringChange(newString: string) {
    setRoomChange(newString);
    let addressInfo = "http://127.0.0.1:5400/chat/message/" + newString;
    axios.get(addressInfo)
      .then(response => {
        setPost(response.data);
      })
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
      <div className='chat'>
        <h1>Chat</h1>
        <div className='chat-container'>
          <div className='container-action-chat'>
            <DoJoinChannel onSubmit={JoinByForm}/>
            <DoPrivateMessage onSubmit={PrivateMessageForm}/>
            <DoOperator onSubmit={OperatorForm}/>
            <DoBanChannel onSubmit={BanForm}/>
            <DoKickChannel onSubmit={KickForm}/>
            <DoQuitChannel onSubmit={QuitForm}/>
            <DoBlockUsers onSubmit={BlockedForm}/>
          </div>
            <ChannelList channelList={channelList} onStringChange={handleStringChange} />
          <h3 id='canal'>{defaultChannelGen}</h3>
          <div className="rcv-mess-container">
            <ChatMap post={post}/>
          </div>
          <div className='send-mess-container'>
            <input  className="input-chat-principal" id="focus-principal-chat" ref={inputRef} onKeyDown={handleKeyDown} type="text" />
            <button className="btn-chat-principal" onClick={sendMessage}>Send</button>
          </div>
        </div>
      </div>
  );
}
