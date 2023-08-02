import React, { useEffect, useRef, useState } from "react";
import { GameChatInterface } from "./Interface/gamechat.interface";
import { JwtPayload } from "../../type/client.type";
import jwt_decode from "jwt-decode";
import { ChatClientSocket } from "./Chat-client";
import muteLogo from "../../resource/muted-logo.png";
import unmuteLogo from "../../resource/unmuted-logo.png";
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
    setIsMute(!isMute);
  }

  function Buttons() {
    
    return <div className="buttons-form">
        <div className="ctn-btn-action">
            {!isMute && <img src={unmuteLogo} alt={"logo notif"} width={50} height={50} onClick={handleMute}></img>}
            {isMute && <img src={muteLogo} alt={"logo notif"} width={50} height={50} onClick={handleMute}></img>}
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

    ChatClientSocket.joinGameChat({ canal: props.canal});

    const gameMessageCallBack = async (data: { sender: string, opponent: string, msg: string, channel: string, blockedUsers: any }) => {
      const newObj = {
        id: msgNum,
        sender: data.sender,
        opponent: data.opponent,
        msg: data.msg,
        channel: data.channel,
        blockedUsers: data.blockedUsers,
      };
      if (!isMute || (isMute && data.sender == me))
        allMessages.push(newObj);
      const newData: GameChatInterface[] = [];
      for (let i = 0; allMessages[i]; i++)
        newData.push(allMessages[i]);
      setAll(newData);
      if (!isMute || (isMute && data.sender == me))
        setMsgNum(msgNum + 1);
    }
        
    ChatClientSocket.onGameMessageRecieve(gameMessageCallBack);

    return () => {
      ChatClientSocket.offGameMessageRecieve(gameMessageCallBack);
    }
  }, [msgNum, me, other, props]);

  return (
    <div className="gamechat-div">
      <div className='gamechat'>
        <div className='gamechat-container'>
          <Buttons />
          <div className="rcv-gamemess-container">
            <ChatMap messages={all} />
          </div>
          <div className='send-gamemess-container'>
            <input className="input-chat-principal" id="focus-principal-chat" ref={inputRef} onKeyDown={handleKeyDown} type="text" />
            <button className="btn-gamechat-principal" onClick={sendMessage}>Send</button>
          </div>
        </div>
      </div>
    </div>
  );
}