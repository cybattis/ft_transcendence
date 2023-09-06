import React, { useEffect, useRef, useState } from "react";
import { GameChatInterface } from "./Interface/gamechat.interface";
import { ChatClientSocket } from "./Chat-client";
import muteLogo from "../../resource/muted-logo.png";
import unmuteLogo from "../../resource/unmuted-logo.png";
import "./PrivateGameChat.css";
const allMessages: any = [];

const maxMessage: number = 126;

export interface PrivateGameChatProps {
  playerNickname: string;
  opponentNickname: string;
  gameId: number;
}

type Message = {
  id: number;
  sender: string;
  content: string;
}

export default function PrivateGameChat(props: PrivateGameChatProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isMute, setIsMute] = useState(false);

  const handleMute = async () => {
    setIsMute(!isMute);
  };

  function Buttons() {
    return (
      <>
        <div className="ctn-btn-action">
          {!isMute && (
            <img
              src={unmuteLogo}
              width={50}
              height={50}
              onClick={handleMute}
            ></img>
          )}
          {isMute && (
            <img
              src={muteLogo}
              width={50}
              height={50}
              onClick={handleMute}
            ></img>
          )}
        </div>
      </>
    );
  }

  function ChatMap({ messages }: { messages: Message[] }) {
    useEffect(() => {
      function scrollbar() {
        const scr = document.getElementById("list-gamemsg-container");
        if (scr) scr.scrollTop += scr.clientHeight;
      }

      scrollbar();
    }, [messages]);

    return (
      <>
        <ul id="list-gamemsg-container" className="list-gamemsg-container">
          {messages.map((messages) =>
              messages.sender === props.playerNickname ? (
                <li className="GameEmt" key={messages.id}>
                  <div className="contain-game-emt">{messages.sender}</div>
                  <div className="contain-game-msg">{messages.content}</div>
                </li>
              ) : (
                <li className="GameRcv" key={messages.id}>
                  <div className="contain-game-emt">{messages.sender}</div>
                  <div className="contain-game-msg">{messages.content}</div>
                </li>
              )
            )}
        </ul>
      </>
    );
  }

  const sendMessage = () => {
    if (
      inputRef.current &&
      inputRef.current.value &&
      inputRef.current.value[0]
    ) {
      const send = {
        gameId: props.gameId,
        sender: props.playerNickname,
        content: inputRef.current.value,
      };
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
    function receiveMessage(message: {sender: string, content: string}) {
      const newMessage: Message = {
        id: allMessages.length,
        sender: message.sender,
        content: message.content,
      }
      allMessages.push(newMessage);
      setMessages([...allMessages]);
    }

    ChatClientSocket.onGameMessageRecieve(receiveMessage);
    ChatClientSocket.joinGameChat(props.gameId);

    return () => {
      ChatClientSocket.offGameMessageRecieve(receiveMessage);
      ChatClientSocket.leaveGameChat(props.gameId);
    };
  }, [props.gameId]);

  return (
    <div className="gamechat-div">
      <div className="gamechat">
        <div className="gamechat-container">
          <div className="rcv-gamemess-container" id="rcv-gamemess-container">
            {!isMute ? <ChatMap messages={messages} /> : null}
          </div>
          <div className="send-gamemess-container">
            <input
              className="input-chat-principal"
              id="focus-principal-chat"
              ref={inputRef}
              onKeyDown={handleKeyDown}
              type="text"
              maxLength={maxMessage}
            />
            <button className="btn-gamechat-principal" onClick={sendMessage}>
              Send
            </button>
            <Buttons />
          </div>
        </div>
      </div>
    </div>
  );
}
