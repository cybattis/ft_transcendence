import React, { useEffect, useRef, useState, useContext } from "react";
import "./Chat.css";
import { ChatInterface } from "./Interface/chat.interface";
import ChannelList from "./List/ChannelList";
import { JwtPayload } from "../../type/client.type";
import jwt_decode from "jwt-decode";
import { NotifContext } from '../../components/Auth/dto';
import axios from "axios";
import { ChatClientSocket } from "./Chat-client";
import joinButton from "../../resource/addButton.png"
import { apiBaseURL } from "../../utils/constant";
import { Link } from "react-router-dom";

const defaultChannelGen: string = "#general";
const channelList: string[] = [];
let username = '';

function takeActiveCanal(): string {
  const canal = document.getElementById('canal');
  return canal?.innerHTML || '';
}

function Quit(props: {canal: string}) {

  const handleQuitButton = () => {
      const sendQuit = { cmd: "quit", username: username, channel: props.canal };
      ChatClientSocket.onQuit(sendQuit);
    };

  if (props.canal !== "#general")
  {
    return <button className="quit-button" onClick={handleQuitButton}>Leave Channel</button>
  }
  return <></>;
}

//Mettre message dans chat quand qqn join, quit etc
//Mettre pop up pour celui qui se fait ban ou kick
//Rendre qqn muet avec un bouton si op pendant un certain temps
//Faire check de list channel si il est pas ban

export default function ChatClient() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [recvMess, setRecvMess] = useState('');
  const [roomChange, setRoomChange] = useState('');
  const [post, setPost] = useState<ChatInterface[]>([]);
  const [messages, setMessages] = useState<ChatInterface[]>([]);
  const socketRef = useRef<any>(null);
  const blocedList: string[] = [];
  const { setNotif } = useContext(NotifContext);
  const [joinForm, setJoinForm] = useState(false);
  const [banForm, setBanForm] = useState(false);
  const [buttons, setButtons] = useState(false);
  const [usr, setUsr] = useState("");
  const [myBlockedList, setMyBlockedList] = useState<string[]>([]);
  const [isOpe, setIsOpe] = useState(false);

  const token = localStorage.getItem("token");
  const payload: JwtPayload = jwt_decode(token as string);

  let decoded: JwtPayload | null = null;
  if (username === "") {
    try {
      decoded = jwt_decode(localStorage.getItem("token")!);
      if (decoded?.nickname) username = decoded.nickname;
    } catch (e) {
      console.log(`Decode error ${e}`);
    }
  }

  async function getBlockedList() {
    await axios.get(apiBaseURL + "user/blockedList",
      {
        headers: {
        Authorization: `Bearer ${token}`,
        }
      },)
      .then((res) => {
        setMyBlockedList(res.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const handleButton = (user: string) => {
    if (user === usr)
    {
      if (buttons)
      setButtons(false);
    }
    setUsr(user);
    if (!buttons)
    {
      setButtons(true);
      setJoinForm(false);
    }
  }

  const handleButtonForm = () => {
    if (buttons)
    {
      setButtons(false);
      setBanForm(false);
    }
    else
    {
      setButtons(true);
      setJoinForm(false);
      setBanForm(false);
    }
  }

  const handleBlock = async () => {
    const sendBlock = { target: usr };
    ChatClientSocket.onBlocked(sendBlock);
    await axios
      .put(apiBaseURL + `user/blockUsr/${usr}`, null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const handleKick = async () => {
    const channel = takeActiveCanal();
    const sendKick = {
      cmd: "kick",
      username: username,
      target: usr,
      channel: channel,
    };
    ChatClientSocket.onKick(sendKick);
  }

  function Ban() {
    const [time, setTime] = useState("");
    const [errors, setErrors] = useState("");

    const handleBan = async (e: any) => {
      e.preventDefault();

      if (!time || !time[0])
      {
        setErrors("Enter a time limit.")
        return ;
      }

      const channel = takeActiveCanal();
      const sendBan = {
        cmd: "ban",
        username: username,
        target: usr,
        channel: channel,
        time: time,
      };
      ChatClientSocket.onBan(sendBan);
      setButtons(false);
      setBanForm(false);
    }

    function handleChange(e: any) {
      e.preventDefault();
  
      const value = e.target.value;
      setTime(value);
    }

    return <div className="ban-form">
      <form method="get" onSubmit={handleBan}>
        <h4>Ban {usr}</h4>
        {errors ? <p className="error"> {errors} </p> : null}
        <div className="test">
          <label>
            Time of ban(in ms)<br />
            <input
              type="text"
              name="time"
              value={time}
              className="input-join"
              onChange={handleChange}
            />
          </label>
        </div>
        <button type="submit" className="submitButton">
                Ban
        </button>
      </form>
    </div>
  }

  const handleBanForm = async () => {
    if (banForm)
      setBanForm(false);
    else
      setBanForm(true);
  }

  function Buttons() {
    const [me, setMe] = useState(false);
    const [isOpe, setIsOpe] = useState(false);

    const keyPress = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (buttons)
        {
          setButtons(false);
          if (banForm)
            setBanForm(false);
        }
      }
    };

    async function getOpeList() {
      let name = takeActiveCanal();
      if (name[0] === '#')
        name = name.slice(1);

      await axios.get(apiBaseURL + "chat/channelName/" + name, {
        headers: {
          token: token,
        }
      })
      .then((res) => {
        console.log(res.data.operator);
        if (res.data.operator.includes(payload.nickname))
          setIsOpe(true);
      })
      .catch((error) => {
        console.log(error);
      });
    }
  
    useEffect(() => {
      getOpeList();
      
      if (usr === payload.nickname)
        setMe(true);
      document.addEventListener("keydown", keyPress);
      return () => document.removeEventListener("keydown", keyPress);
    });
  
    console.log(isOpe);

    return <div className="buttons-form">
      <form method="get" onSubmit={handleButtonForm}>
        <h4>Choose your action <br /> on {usr}</h4>
        {!me && <button className="chat-buttons" onClick={handleBlock}>Block</button>}
        {!me && isOpe && <button className="chat-buttons" onClick={handleKick}>Kick</button>
        && <button className="chat-buttons" onClick={handleBanForm}>Ban</button>}
        <Link to={`/profile/${usr}`}>
          <button className="chat-buttons">Profile</button>
        </Link>
      </form>
      {banForm && <Ban />}
    </div>
  }

  function ChatMap({messages} : {messages : ChatInterface[]}) {

    const filteredElements = messages
      .filter((rcv: ChatInterface) => rcv.channel === takeActiveCanal())
      .map((rcv: ChatInterface, key: number) => (
      rcv.emitter === username ? (
        <li className="Emt" key={key}>
          <div className="contain-emt" onClick={() => {handleButton(rcv.emitter)}}>{rcv.emitter}</div>
          <div className="contain-msg">{rcv.content}</div>
        </li>
      ) : (
        <li className="Rcv" key={key}>
          <div className="contain-emt" onClick={() => {handleButton(rcv.emitter)}}>{rcv.emitter}</div>
          <div className="contain-msg">{rcv.content}</div>
        </li>
      )
    ));
    return <>
      <ul className="list-msg-container">{filteredElements}</ul>
    </>
  }

  function JoinForm() {
    const [errorInput, setErrorInput] = useState("");
    const [state, setState] = useState({
      channel: "",
      pwd: ""
    });
    
    function handleChange(e: any) {
      e.preventDefault();
  
      setErrorInput("");
  
      const value = e.target.value;
      setState({
        ...state,
        [e.target.name]: value
      });
    }
    
    const sendForm = (channel: string, password: string) => {
      if (channel.indexOf("#") === -1) channel = "#" + channel;
      const type : string = "public";
      const sendJoin = {username: username, channel: channel, password: password, type: type};
      ChatClientSocket.onJoin(sendJoin);
      setJoinForm(false);
    }
    
    const handleSubmitJoin = async (e: React.SyntheticEvent) => {
      e.preventDefault();
      if (!state.channel || !state.channel[0])
      {
        setErrorInput("Enter a channel Name");
      }
      else
      {
        for (let i = 0; state.channel[i]; i ++)
        {
          if (state.channel[i] === '#')
          {
            setErrorInput("Can't contain '#'.")
            return ;
          }
        }
      }
      if (state.pwd[0])
      {
        const exists = await axios.get(apiBaseURL + "chat/channel/find/" + state.channel + "/" + state.pwd)
        if (exists.data.status === 404 && exists.data.name === "NotFoundException")
          sendForm(state.channel, state.pwd);
        else if (exists.data.status === 404 && exists.data.name === "NotFoundException")
          setErrorInput("Password mismatch.");
        }
      else
      {
        const exists = await axios.get(apiBaseURL + "chat/channel/findName/" + state.channel);
        if (exists.data.status === 404 && exists.data.name === "NotFoundException")
          sendForm(state.channel, state.pwd);
        else if (exists.data.status === 404 && exists.data.name === "NotFoundException")
          setErrorInput("Password mismatch.");
      }
    }
  
    return <div className="join-form">
      <form method="get" onSubmit={handleSubmitJoin}>
        <h4>Join a Channel</h4>
        <div className="test">
          {errorInput ? <p className="error"> {errorInput} </p> : null}
          <label>
            Channel<br />
            <input
              type="text"
              name="channel"
              value={state.channel}
              className="input-join"
              onChange={handleChange}
            />
          </label>
        </div>
        <div>
          <label>
            Password<br />
            <input
              type="password"
              name="pwd"
              className="input-join"
              value={state.pwd}
              onChange={handleChange}
            />
          </label>
        </div>
        <button type="submit" className="submitButton">
                Join
        </button>
      </form>
    </div>
  }
  
  function Join() {
    const keyPress = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (joinForm) setJoinForm(false);
      }
    };
  
    useEffect(() => {
      document.addEventListener("keydown", keyPress);
      return () => document.removeEventListener("keydown", keyPress);
    });
  
    const handleJoin = () => {
      if (joinForm)
        setJoinForm(false);
      else
      {
        setJoinForm(true);
        setButtons(false);
      }
    }
  
    return <>
      <button className="add" onClick={handleJoin}>
        <img className="addImg" src={joinButton}></img>
      </button>
      {joinForm && <JoinForm />}
    </>
  }

  const sendMessage = () => {
    if (inputRef.current && inputRef.current.value && inputRef.current.value[0]) {
      const cmd = choiceCmd(inputRef.current.value);
      doCmd(cmd, inputRef.current.value);
      inputRef.current.value = "";
    }
  };

  useEffect(() => {
    getBlockedList();

    const messageCallBack = async (data: {sender: string, msg: string, channel: string}) => {
      let addressInfo = apiBaseURL + "chat/message/" + data.channel;
      await axios.get(addressInfo)
      .then(response => {
        const newData: ChatInterface[] = [];
        for (let i = 0; response.data[i]; i ++)
        {
          if (response.data[i].emitter === payload.nickname)
            newData.push(response.data[i]);
          else if (myBlockedList && myBlockedList.includes(response.data[i].emitter))
            continue ;
          else
            newData.push(response.data[i])
        }
        setMessages(newData);
      })
      setRecvMess(data.msg);
    }

    ChatClientSocket.onMessageRecieve(messageCallBack);

    if (!channelList.includes(defaultChannelGen)) {
      const send = { username: username, channel: defaultChannelGen };
      ChatClientSocket.joinChatServer(send);
    }

    const joinCallBack = (room: string) => {
      if (!channelList.includes(room)) {
        channelList.push(room);
      setRoomChange(room);
      const canal = document.getElementById("canal");
      if (canal) canal.innerHTML = room;
    }
  }

  ChatClientSocket.onJoinChan(joinCallBack);

    const blockedCallBack = (target: string) => {
      if (!blocedList.includes(target))
        blocedList.push(target);
  }

  ChatClientSocket.addBlockCb(blockedCallBack);

  ChatClientSocket.joinChatServer(joinCallBack);

    const quitCallBack = (room: string) => {
      for (let index = 0; index < channelList.length; index++) {
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
  }

  ChatClientSocket.addQuitCb(quitCallBack);

    const inviteCallBack = (data: { username: string; target: string }) => {
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
    }

  ChatClientSocket.addInvCb(inviteCallBack);

  return () => {
    ChatClientSocket.offJoinChan(joinCallBack);
    ChatClientSocket.offBlock(blockedCallBack);
    ChatClientSocket.offQuit(quitCallBack);
    ChatClientSocket.offInv(inviteCallBack);
    ChatClientSocket.offMessageRecieve(messageCallBack);
  }
  }, [roomChange]);

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
    if (cmd === "/info")
    ChatClientSocket.onInfo(channel);
    else if (cmd === "/cmd") {
      ChatClientSocket.onCmd(channel);
    } else {
      const send = {username: username, channel: channel, msg: msg}
      ChatClientSocket.onSend(send);
      let addressInfo = apiBaseURL + "chat/message/" + takeActiveCanal();
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
    ChatClientSocket.onPm(sendPrv);
    return;
  };
  
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
    ChatClientSocket.onOp(message);
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
    ChatClientSocket.onBan(sendBan);
  };

  function takeMess(mess: string): string {
    return mess.substring(mess.indexOf("%") + 1);
  }

  async function handleStringChange(newString: string) {
    setRoomChange(newString);
    let addressInfo = apiBaseURL + "chat/message/" + newString;
    await axios.get(addressInfo)
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

  //Si bloque du chat bouton debloque et profile
  //Si op donner tout les boutons

  return (
      <div className='chat'>
        <h1>Chat</h1>
        <div className='chat-container'>
          <div className="list">
            <ChannelList channelList={channelList} onStringChange={handleStringChange} />
          </div>
            <Join />
            {buttons && <Buttons />}
          <h3 id='canal'>{defaultChannelGen}</h3>
            <Quit canal={takeActiveCanal()}/>
          <div className="rcv-mess-container">
            <ChatMap messages={messages}/>
          </div>
          <div className='send-mess-container'>
            <input  className="input-chat-principal" id="focus-principal-chat" ref={inputRef} onKeyDown={handleKeyDown} type="text" />
            <button className="btn-chat-principal" onClick={sendMessage}>Send</button>
          </div>
        </div>
      </div>
  );
}