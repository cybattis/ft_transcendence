import React, { useEffect, useRef, useState } from "react";
import { GameChatInterface } from "./Interface/gamechat.interface";
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

  const handleMute = async () => {
    setIsMute(!isMute);
  }

  function Buttons() {

    return <>
        <div className="ctn-btn-action">
            {!isMute && <img src={unmuteLogo} width={50} height={50} onClick={handleMute}></img>}
            {isMute && <img src={muteLogo} width={50} height={50} onClick={handleMute}></img>}
        </div>
    </>
  }

  function ChatMap({ messages }: { messages: GameChatInterface[] }) {

    useEffect(() => {
      function scrollbar(){
        const scr = document.getElementById("list-gamemsg-container");
        if (scr) scr.scrollTop += scr.clientHeight;
        console.log(scr?.clientHeight);
      }

      scrollbar();
    }, [messages]);

    return (
      <>
        <ul id="list-gamemsg-container" className="list-gamemsg-container">
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
  }, [msgNum, me, other, props, isMute]);

  return (
    <div className="gamechat-div">
      <div className='gamechat'>
        <div className='gamechat-container'>
          <div className="rcv-gamemess-container" id="rcv-gamemess-container">
            <ChatMap messages={all} />
          </div>
          <div className='send-gamemess-container'>
            <input className="input-chat-principal" id="focus-principal-chat" ref={inputRef} onKeyDown={handleKeyDown} type="text" />
            <button className="btn-gamechat-principal" onClick={sendMessage}>Send</button>
            <Buttons />
          </div>
        </div>
      </div>
    </div>
  );
}