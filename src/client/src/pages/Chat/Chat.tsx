import React, { useEffect, useRef, useState, useContext } from "react";
import "./Chat.css";
import { ChatInterface } from "./Interface/chat.interface";
import ChannelList from "./List/ChannelList";
import { JwtPayload } from "../../type/client.type";
import jwt_decode from "jwt-decode";
import Select from "react-select";
import { NotifContext } from '../../components/Auth/dto';
import axios from "axios";
import { ChatClientSocket } from "./Chat-client";
import joinButton from "../../resource/addButton.png"
import { apiBaseURL } from "../../utils/constant";
import { Link } from "react-router-dom";
import priv from "../../resource/join.svg";

const defaultChannelGen: string = "#general";
const channelList: string[] = [];
let username = '';

function takeActiveCanal(): string {
  const canal = document.getElementById('canal');
  return canal?.innerHTML || '';
}

function Quit(props: { canal: string }) {

  const handleQuitButton = () => {
    const sendQuit = { cmd: "quit", username: username, channel: props.canal };
    ChatClientSocket.onQuit(sendQuit);
  };

  if (props.canal !== "#general") {
    return <button className="quit-button" onClick={handleQuitButton}>Leave Channel</button>
  }
  return <></>;
}

export default function ChatClient() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [recvMess, setRecvMess] = useState('');
  const [roomChange, setRoomChange] = useState('');
  const [post, setPost] = useState<ChatInterface[]>([]);
  const socketRef = useRef<any>(null);
  const blocedList: string[] = [];
  const { setNotif } = useContext(NotifContext);
  const [joinForm, setJoinForm] = useState(false);
  const [messagePrivateForm, setMessagePrivateForm] = useState(false);
  const [buttons, setButtons] = useState(false);
  const [usr, setUsr] = useState("");

  const token = localStorage.getItem("token");
  const payload: JwtPayload = jwt_decode(token as string);

  let decoded: JwtPayload | null = null;
  if (username === "") {
    try {
      decoded = jwt_decode(localStorage.getItem("token")!);
      if (decoded?.username) username = decoded.username;
    } catch (e) {
      console.log(`Decode error ${e}`);
    }
  }

  const handleButton = (user: string) => {
    if (user === usr) {
      if (buttons)
        setButtons(false);
    }
    setUsr(user);
    if (!buttons) {
      setButtons(true);
      setJoinForm(false);
    }
  }

  const handleButtonForm = () => {
    if (buttons)
      setButtons(false);
    else {
      setButtons(true);
      setJoinForm(false);
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

  const handleAddOpe = async () => {
    const ope = {
      op: "op",
      channel: takeActiveCanal(),
      author: username,
      cmd: "+o",
      target: usr
    }
    ChatClientSocket.onOp(ope);
  }

  const handleSubOpe = async () => {
    const ope = {
      op: "op",
      channel: takeActiveCanal(),
      author: username,
      cmd: "-o",
      target: usr
    }
    ChatClientSocket.onOp(ope);
  }

  function Buttons() {
    const [me, setMe] = useState(false);

    useEffect(() => {
      const keyPress = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          if (buttons) setButtons(false);
        }
      };
      if (usr === payload.username)
        setMe(true);
      document.addEventListener("keydown", keyPress);
      return () => document.removeEventListener("keydown", keyPress);
    });

    return <div className="buttons-form">
      <form method="get" onSubmit={handleButtonForm}>
        <h4>Choose your action <br /> on {usr}</h4>
        <div className="ctn-btn-action">
          {!me && <button className="chat-buttons" onClick={handleBlock}>Block</button>}
          <Link to={`/profile/${usr}`}>
            <button className="chat-buttons">Profile</button>
          </Link>
          <OpeBtn />
        </div>
      </form>
    </div>
  }

  function ChatMap({ post }: { post: ChatInterface[] }) {

    const filteredElements = post
      .filter((rcv: ChatInterface) => rcv.channel === takeActiveCanal())
      .map((rcv: ChatInterface, key: number) => (
        rcv.emitter === username ? (
          <li className="Emt" key={key}>
            <div className="contain-emt" onClick={() => { handleButton(rcv.emitter) }}>{rcv.emitter}</div>
            <div className="contain-msg">{rcv.content}</div>
          </li>
        ) : (
          <li className="Rcv" key={key}>
            <div className="contain-emt" onClick={() => { handleButton(rcv.emitter) }}>{rcv.emitter}</div>
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
      pwd: "",
      selectedOption: "public",
    });

    const handleSelect = (event: any) => {
      if (event) {
        const value = event.value;
        state.selectedOption = value;
      }
    }

    function handleChange(e: any) {
      e.preventDefault();

      setErrorInput("");

      const value = e.target.value;
      setState({
        ...state,
        [e.target.name]: value
      });
    }

    const sendForm = (channel: string, password: string, type: string) => {
      if (channel.indexOf("#") === -1) channel = "#" + channel;
      console.log(`SendJoim`, channel, password, type);
      const sendJoin = { username: username, channel: channel, password: password, type: type };
      ChatClientSocket.onJoin(sendJoin);
      setJoinForm(false);
    }

    const handleSubmitJoin = async (e: React.SyntheticEvent) => {
      e.preventDefault();
      if (state)
        console.log(state);
      if (!state.channel || !state.channel[0]) {
        setErrorInput("Enter a channel Name");
      }
      if (state.pwd[0]) {
        const exists = await axios.get(apiBaseURL + "chat/channel/find/" + state.channel + "/" + state.pwd)
        if (exists.data.status === 404 && exists.data.name === "NotFoundException")
          sendForm(state.channel, state.pwd, state.selectedOption);
        else if (exists.data.status === 404 && exists.data.name === "NotFoundException")
          setErrorInput("Password mismatch.");
      }
      else {
        const exists = await axios.get(apiBaseURL + "chat/channel/" + state.channel);
        if (exists.data.status === 404 && exists.data.name === "NotFoundException")
          sendForm(state.channel, state.pwd, state.selectedOption);
        else if (exists.data.status === 404 && exists.data.name === "NotFoundException")
          setErrorInput("Password mismatch.");
      }
    }

    const options = [
      { value: "public", label: 'Public' },
      { value: "private", label: 'Private' },
      { value: "protected", label: 'Protected' }
    ]
    
    return <div className="join-form">
      <form method="get" onSubmit={handleSubmitJoin}>
        <h4>Join a Channel</h4>
        <Select
          defaultValue={options[0]}
          onChange={handleSelect}
          options={options}
        />
        <div className="test">
          {errorInput ? <p className="error"> {errorInput} </p> : null}
          <label>
            Channel<br />
          </label>
          <input
            type="text"
            name="channel"
            value={state.channel}
            className="input-join"
            onChange={handleChange}
          />
        </div>
        o
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

  function OpeBtn() {
    const [state, setState] = useState({
      senderIsOpe: false,
      targetIsOpe: false,
    });
    const channel = takeActiveCanal();


    useEffect(() => {
      async function IsOpe() {
        const channelB = channel.substring(1);
        const sendUsername = apiBaseURL + "chat/channel/ope/" + channelB + "/" + username;
        const sendTarget = apiBaseURL + "chat/channel/ope/" + channelB + "/" + usr;
        const info = await axios.get(sendUsername);
        const bis = await axios.get(sendTarget);
        setState({ senderIsOpe: info.data, targetIsOpe: bis.data });
      }
      IsOpe();
    }, []);

    return (
      <>
        {state.senderIsOpe && username !== usr?
          !state.targetIsOpe ?
          <button className="chat-buttons" onClick={handleAddOpe}>
            Add operator
          </button>
          :
          <button className="chat-buttons" onClick={handleSubOpe}>
            Sub operator
          </button>
          :
          <></>
        }
      </>);
  }

  function PrivateMessage(){
    
    const btnPrv = () => {
      messagePrivateForm ? setMessagePrivateForm(false) : setMessagePrivateForm(true);
    }

    const handlePrivate = () => {
      const sendPrv = { username: username, target: usr };
      ChatClientSocket.onPm(sendPrv);
    };

    return (
      <>
      <button className="prv" onClick={btnPrv}>
        Private Message
      </button>
      {messagePrivateForm && <AffPrivateMessage />}
      </>
    )
  }

  function AffPrivateMessage (){
    return <>
    Formulaire private
    </>
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
      else {
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
    const messageCallBack = async (data: { sender: string, msg: string, channel: string, blockedChat: any }) => {
      let addressInfo = apiBaseURL + "chat/message/" + data.channel;
      await axios.get(addressInfo)
        .then(response => {
          const newData: ChatInterface[] = [];
          for (let i = 0; response.data[i]; i++) {
            // if (!data.blockedChat.includes(response.data[i].emitter))
            newData.push(response.data[i]);
          }
          setPost(newData);
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
      const send = { username: username, channel: channel, msg: msg }
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

  const KickForm = (target: string) => {
    const channel = takeActiveCanal();
    const sendKick = {
      cmd: "kick",
      username: username,
      target: target,
      channel: channel,
    };
    ChatClientSocket.onKick(sendKick);
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

  //Faire en sorte que si c est moi juste voir profile et msgprv
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
        <PrivateMessage />
        {buttons && <Buttons />}
        <h3 id='canal'>{defaultChannelGen}</h3>
        <Quit canal={takeActiveCanal()} />
        <div className="rcv-mess-container">
          <ChatMap post={post} />
        </div>
        <div className='send-mess-container'>
          <input className="input-chat-principal" id="focus-principal-chat" ref={inputRef} onKeyDown={handleKeyDown} type="text" />
          <button className="btn-chat-principal" onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}