import React, { useEffect, useRef, useState } from "react";
import { GameChatInterface } from "./Interface/gamechat.interface";
import { JwtPayload } from "../../type/client.type";
import jwt_decode from "jwt-decode";
import { ChatClientSocket } from "./Chat-client";
import "./PrivateGameChat.css";

const allMessages: any = [];

export default function PrivateGameChat(props: {playerOne: string, playerTwo: string, canal: string, myUsername: string}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [all, setAll] = useState<GameChatInterface[]>([]);
  const [isMute, setIsMute] = useState(false);
  const [me, setMe] = useState('');
  const [other, setOther] = useState('');
  const [msgNum, setMsgNum] = useState(0);
  
  //Si user est bloque faire en sorte que rien ne marche dans le chat

  const token = localStorage.getItem("token");
  const payload: JwtPayload = jwt_decode(token as string);

  let decoded: JwtPayload | null = null;
  try {
      decoded = jwt_decode(localStorage.getItem("token")!);
  } catch (e) {
      console.log(`Decode error ${e}`);
  }

  const handleMute = async () => {
    let sendMute;
    if (props.playerOne === props.myUsername)
    {
        sendMute = {
            cmd: "mute",
            username: props.playerOne,
            target: props.playerTwo,
            channel: props.canal,
        };
    }
    else {
        sendMute = {
            cmd: "mute",
            username: props.playerTwo,
            target: props.playerOne,
            channel: props.canal,
        };
    }
    ChatClientSocket.mute(sendMute);
  }

  const handleUnMute = async () => {
    let sendMute;
    if (props.playerOne === props.myUsername)
    {
        sendMute = {
            cmd: "mute",
            username: props.playerOne,
            target: props.playerTwo,
            channel: props.canal,
        };
    }
    else {
        sendMute = {
            cmd: "mute",
            username: props.playerTwo,
            target: props.playerOne,
            channel: props.canal,
        };
    }
    ChatClientSocket.unMute(sendMute);
  }

  function Buttons() {
    
    //Mettre icone en haut a droit du channel pour mute
    return <></>
    return <div className="buttons-form">
        <div className="ctn-btn-action">
            {!isMute && <button className="chat-buttons" onClick={handleMute}>Mute</button>}
            {isMute && <button className="chat-buttons" onClick={handleUnMute}>UnMute</button>}
        </div>
    </div>
  }

  function ChatMap({ messages }: { messages: GameChatInterface[] }) {

    useEffect(() => {}, [messages]);

    return (
      <>
        <ul className="list-gamemsg-container">
          {messages
            .filter((messages) => props.canal ? messages.channel === props.canal : null)
            .map((messages) =>
              messages.sender === props.myUsername ? (
                <li className="GameEmt" key={messages.id}>
                  <div className="contain-game-emt">{messages.sender}</div>
                  <div className="contain-game-msg">{messages.msg}</div>
                </li>
              ) : (
                <li className="GameRcv" key={messages.id}>
                  <div className="contain-game-emt">{messages.sender}</div>
                  <div className="contain-game-msg">{messages.msg}</div>
                </li>
              )
            )}
        </ul>
      </>
    );
  }

  const sendMessage = () => {
    if (inputRef.current && inputRef.current.value && inputRef.current.value[0]) {
      const send = { username: me, opponent: other, channel: props.canal, msg: inputRef.current.value }
      ChatClientSocket.sendGameChat(send);
      inputRef.current.value = "";
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      sendMessage();
    }
  };
  
  useEffect(() => {

    const fetchgameInfo = async () => {
        if (props.playerOne === props.myUsername)
        {
          setMe(props.playerOne);
          setOther(props.playerTwo)
        }
        else {
          setOther(props.playerOne);
          setMe(props.playerTwo)
        }
    }

    fetchgameInfo();

    const gameMessageCallBack = async (data: { sender: string, opponent: string, msg: string, channel: string, blockedUsers: any }) => {
      const newObj = {
        id: msgNum,
        sender: data.sender,
        opponent: data.opponent,
        msg: data.msg,
        channel: data.channel,
        blockedUsers: data.blockedUsers,
      };
      allMessages.push(newObj);
      const newData: GameChatInterface[] = [];
      for (let i = 0; allMessages[i]; i++)
        newData.push(allMessages[i]);
      setAll(newData);
      setMsgNum(msgNum + 1);
    }
        
    ChatClientSocket.onGameMessageRecieve(gameMessageCallBack);
    ChatClientSocket.joinGameChat({ canal: props.canal});

    return () => {
      ChatClientSocket.offGameMessageRecieve(gameMessageCallBack);
    }
  }, [msgNum, me, other]);

  return (
    <div className="chat-div">
      <h1>Game Chat</h1>
      <div className='chat'>
        <div className='chat-container'>
          <Buttons />
          <div className="rcv-mess-container">
            <ChatMap messages={all} />
          </div>
          <div className='send-mess-container'>
            <input className="input-chat-principal" id="focus-principal-chat" ref={inputRef} onKeyDown={handleKeyDown} type="text" />
            <button className="btn-chat-principal" onClick={sendMessage}>Send</button>
          </div>
        </div>
      </div>
    </div>
  );
}