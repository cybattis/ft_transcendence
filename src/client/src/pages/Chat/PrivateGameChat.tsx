import React, { useEffect, useRef, useState } from "react";
import { GameChatInterface } from "./Interface/gamechat.interface";
import { JwtPayload } from "../../type/client.type";
import jwt_decode from "jwt-decode";
import axios from "axios";
import { ChatClientSocket } from "./Chat-client";
import { apiBaseURL } from "../../utils/constant";
import UsersList from "./List/UsersList";
import "./PrivateGameChat.css";
import { ErrorModalChat } from "../../components/Modal/ErrorModal";

export default function PrivateGameChat() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [messages, setMessages] = useState<GameChatInterface[]>([]);
  const [isMute, setIsMute] = useState(false);
  const [canal, setCanal] = useState('');
  const [playerOne, setPlayerOne] = useState('');
  const [playerTwo, setPlayerTwo] = useState('');

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
    if (playerOne === payload.nickname)
    {
        sendMute = {
            cmd: "mute",
            username: playerOne,
            target: playerTwo,
            channel: canal,
        };
    }
    else {
        sendMute = {
            cmd: "mute",
            username: playerTwo,
            target: playerOne,
            channel: canal,
        };
    }
    ChatClientSocket.onMute(sendMute);
  }

  const handleUnMute = async () => {
    let sendMute;
    if (playerOne === payload.nickname)
    {
        sendMute = {
            cmd: "mute",
            username: playerOne,
            target: playerTwo,
            channel: canal,
        };
    }
    else {
        sendMute = {
            cmd: "mute",
            username: playerTwo,
            target: playerOne,
            channel: canal,
        };
    }
    ChatClientSocket.onUnMute(sendMute);
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

  function UsersGameList(props: { channel: string, messages: GameChatInterface[] }) {
      const [usersList, setUsersList] = useState([]);

      return (
              <div className="lists">
                  <h4>Players</h4>
                    <button className="user-list">
                        {playerOne}
                    </button>
                    <button className="user-list">
                        {playerTwo}
                    </button>
              </div>
      );
  }

  function ChatMap({ messages }: { messages: GameChatInterface[] }) {

    return (
      <>
        <ul className="list-msg-container">
          {messages && messages
            .filter((messages) => canal ? messages.channel === canal : messages.channel === canal)
            .map(messages => (
              messages.emitter === decoded?.nickname ? (
                <li className="Emt" key={messages.id}>
                  <div className="contain-emt">{messages.emitter}</div>
                  <div className="contain-msg">{messages.content}</div>
                </li>
              ) : (
                <li className="Rcv" key={messages.id}>
                  <div className="contain-emt">{messages.emitter}</div>
                  <div className="contain-msg">{messages.content}</div>
                </li>
              )
            ))}
        </ul>
      </>
    )
  }

  const sendMessage = () => {
    if (inputRef.current && inputRef.current.value && inputRef.current.value[0]) {
      const cmd = choiceCmd(inputRef.current.value);
      doCmd(cmd, inputRef.current.value);
      inputRef.current.value = "";
    }
  };

  
  useEffect(() => {

    setPlayerOne('A');
    setPlayerTwo('a');
    setCanal('dcvfdbgfhlioj'); // METTRE UN ID comme nom de canal

     const messageCallBack = async (data: { sender: string, msg: string, channel: string }) => {
          let addressInfo = apiBaseURL + "chat/gameChat/" + data.channel;
          await axios.get(addressInfo)
          .then(res => {
              setMessages(res.data);
            });
        }
        
    ChatClientSocket.onMessageRecieve(messageCallBack)
    ChatClientSocket.joinGameChat({username: payload.nickname, canal: canal});

    return () => {
        ChatClientSocket.offMessageRecieve(messageCallBack);
    }
  }, [playerOne, playerTwo, canal]);

function choiceCmd(input: string): string {
  if (input.indexOf("/") === 0) {
    if (input.indexOf(" ") !== -1)
      return input.substring(0, input.indexOf(" "));
    return input;
  }
  return "/msg";
}

function doCmd(cmd: string, msg: string) {
    const send = { username: payload.nickname, opponent: playerTwo, channel: canal, msg: msg }
    ChatClientSocket.onSendGameChat(send);
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      sendMessage();
    }
  };

return (
  <div className="chat-div">
    <h1>Game Chat</h1>
    <div className='chat'>
      <div className='chat-container'>
        <Buttons />
        <div className="rcv-mess-container">
          <ChatMap messages={messages} />
        </div>
        <div className='send-mess-container'>
          <input className="input-chat-principal" id="focus-principal-chat" ref={inputRef} onKeyDown={handleKeyDown} type="text" />
          <button className="btn-chat-principal" onClick={sendMessage}>Send</button>
        </div>
      </div>
      <div className="user-lists">
        <UsersGameList messages={messages} channel={canal} />
      </div>
    </div>
  </div>
);
}