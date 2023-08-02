import React, { useEffect, useRef, useState, useContext } from "react";
import "./Chat.css";
import { ChatInterface } from "./Interface/chat.interface";
import ChannelList from "./List/ChannelList";
import { JwtPayload } from "../../type/client.type";
import jwt_decode from "jwt-decode";
import Select from "react-select";
import axios from "axios";
import { ChatClientSocket } from "./Chat-client";
import joinButton from "../../resource/more-logo.png";
import { apiBaseURL } from "../../utils/constant";
import { Link } from "react-router-dom";
import { Avatar } from "../../components/Avatar";
import UsersList from "./List/UsersList";
import { ErrorModalChat } from "../../components/Modal/ErrorModal";
import ParamLogo from "../../resource/param-logo.png";
import PrvLogo from "../../resource/message-logo.png";
import QuitLogo from "../../resource/quit-logo.png";
import InvLogo from "../../resource/invite-logo.png";

//QUAND CHANGEMENT DE PERMS< BAN ETC PAS RESPONSIVE DANS LISTE ESSAYE DE TOUT METTRE AU MEME ENDROIT POUR SOCKET
//FAIRE CHANGEMENT DANS DB CHAT QUAND CHANGEMENT NAME PEUT ETRE UTILISE ID ET PAS USERNAME
const defaultChannelGen: string = "#general";
const channelList: string[] = [];

export default function ChatClient() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [roomChange, setRoomChange] = useState("");
  const [messages, setMessages] = useState<ChatInterface[]>([]);
  const blocedList: string[] = [];
  const [joinForm, setJoinForm] = useState(false);
  const [banForm, setBanForm] = useState(false);
  const [messagePrivateForm, setMessagePrivateForm] = useState(false);
  const [buttons, setButtons] = useState(false);
  const [usr, setUsr] = useState("");
  const [isOpe, setIsOpe] = useState(false);
  const [isBan, setIsBan] = useState(false);
  const [isMute, setIsMute] = useState(false);
  const [isHere, setIsHere] = useState(false);
  const [errorMessage, setErrorMessage] = useState({
    channel: "",
    error: "",
  });

  const token = localStorage.getItem("token");
  const payload: JwtPayload = jwt_decode(token as string);
  let decoded: JwtPayload | null = null;
  let username = payload.nickname;
  
  function takeActiveCanal(): string {
    const canal = document.getElementById('canal');
    return canal ? canal.innerHTML : defaultChannelGen;
  }
  
  function Quit(props: { canal: string }) {
    const handleQuitButton = () => {
      const sendQuit = { cmd: "quit", username: username, channel: props.canal };
      ChatClientSocket.quit(sendQuit);
    };
  
    if (props.canal !== defaultChannelGen && props.canal[0] === "#") {
      return (
        <button className="button-chat" onClick={handleQuitButton}>
          <img
            className="logo-chat"
            src={QuitLogo}
            alt="Quit Channel"
            title={"Quit channel"}
          />
        </button>
      );
    }
    return <></>;
  }
  
  function Param(props: { canal: string }) {
    const token = localStorage.getItem("token");
    const [buttonParam, setButtonParam] = useState(false);
    const [owner, setOwner] = useState(false);
    const channel = takeActiveCanal();
  
    function AffParam() {
      const [inputParam, setInputForm] = useState({
        pwd: "",
        selectedOption: "public",
      });
  
      const handleSubmitParam = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        const channel = takeActiveCanal();
        const sendParam = {
          channel: channel,
          type: inputParam.selectedOption,
          pwd: inputParam.pwd,
          username: username,
        };
        ChatClientSocket.updateChannel(sendParam);
        setButtonParam(false);
      };
  
      const handleParam = (event: any) => {
        event.preventDefault();
  
        const value = event.target.value;
        setInputForm({
          ...inputParam,
          [event.target.name]: value,
        });
      };
  
      const handleSelectParam = (event: any) => {
        if (event) {
          const value = event.value;
          inputParam.selectedOption = value;
        }
      };
  
      const options = [
        { value: "public", label: "Public" },
        { value: "private", label: "Private" },
        { value: "protected", label: "Protected" },
      ];
  
      return (
        <div className="ctnr-param">
          <h4>Setting Channel</h4>
          <form className="form-param" method="get" onSubmit={handleSubmitParam}>
            <Select
              defaultValue={options[0]}
              onChange={handleSelectParam}
              options={options}
            />
            <label>
              Password
              <br />
              <input
                type="password"
                name="pwd"
                className="input-join"
                onChange={handleParam}
                value={inputParam.pwd}
              />
            </label>
            <button type="submit" className="submitButton">
              Change
            </button>
          </form>
        </div>
      );
    }
  
    useEffect(() => {
      async function isOwner() {
        if (props.canal[0] != "#") {
          setOwner(false);
          return;
        }
        const channelB = channel.substring(1);
        const sendOwner =
          apiBaseURL +
          "chat-controller/channel/owner/" +
          channelB +
          "/" +
          username;
        const bool = await axios.get(sendOwner, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        bool.data ? setOwner(true) : setOwner(false);
      }
  
      isOwner();
    });
  
    const btnParam = () => {
      buttonParam ? setButtonParam(false) : setButtonParam(true);
    };
  
    if (!owner) return <></>;
    else
      return (
        <>
          <button className="button-chat" onClick={btnParam}>
            <img
              className="logo-chat"
              src={ParamLogo}
              alt="Param"
              title={"Channel Param"}
            />
          </button>
          {buttonParam && <AffParam />}
        </>
      );
  }

  if (username === "") {
    try {
      decoded = jwt_decode(localStorage.getItem("token")!);
      if (decoded?.nickname) username = decoded.nickname;
    } catch (e) {
      console.log(`Decode error ${e}`);
    }
  }

  const handleButton = async (user: string) => {
    if (user === usr) {
      if (buttons) setButtons(false);
    }
    setUsr(user);
    if (!buttons) {
      setButtons(true);
      setJoinForm(false);
    }
  };

  const handleButtonForm = () => {
    if (buttons) {
      setButtons(false);
      setBanForm(false);
    } else {
      setButtons(true);
      setJoinForm(false);
    }
  };

  const handleBlock = async () => {
    const sendBlock = { target: usr };
    ChatClientSocket.blocked(sendBlock);
    await axios
      .put(apiBaseURL + `user/blockUsr/${usr}`, null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleAddOpe = async () => {
    const ope = {
      op: "op",
      channel: takeActiveCanal(),
      author: username,
      cmd: "+o",
      target: usr,
    };
    ChatClientSocket.operator(ope);
  };

  const handleSubOpe = async () => {
    const ope = {
      op: "op",
      channel: takeActiveCanal(),
      author: username,
      cmd: "-o",
      target: usr,
    };
    ChatClientSocket.operator(ope);
  };

  const handleKick = async () => {
    const channel = takeActiveCanal();
    const sendKick = {
      cmd: "kick",
      username: username,
      target: usr,
      channel: channel,
    };
    ChatClientSocket.kick(sendKick);
  };

  const handleUnBan = async () => {
    const channel = takeActiveCanal();
    const sendBan = {
      cmd: "-b",
      username: username,
      target: usr,
      channel: channel,
    };
    ChatClientSocket.unBan(sendBan);
  };

  const handleMute = async () => {
    const channel = takeActiveCanal();
    const sendMute = {
      cmd: "mute",
      username: username,
      target: usr,
      channel: channel,
    };
    ChatClientSocket.mute(sendMute);
  };

  const handleUnMute = async () => {
    const channel = takeActiveCanal();
    const sendMute = {
      cmd: "mute",
      username: username,
      target: usr,
      channel: channel,
    };
    ChatClientSocket.unMute(sendMute);
  };

  function Ban() {
    const [time, setTime] = useState("");
    const [errors, setErrors] = useState("");

    const isValidTime = async (time: string) => {
      for (let i = 0; time[i]; i++) {
        if (time[i] < "0" || time[i] > "9") return false;
      }
      return true;
    };

    const handleBan = async (e: any) => {
      e.preventDefault();

      if (!time || !time[0]) setTime("30000");
      else if (time[0] === "-" || !isValidTime(time)) {
        setErrors("Enter a valid time.");
        return;
      }

      const channel = takeActiveCanal();
      const sendBan = {
        cmd: "+b",
        username: username,
        target: usr,
        channel: channel,
        time: time,
      };
      ChatClientSocket.ban(sendBan);
      setBanForm(false);
      setButtons(false);
    };

    function handleChange(e: any) {
      e.preventDefault();

      const value = e.target.value;
      setTime(value);
    }

    return (
      <div className="ban-form">
        <form>
          <h4>Ban {usr}</h4>
          {errors ? <p className="error"> {errors} </p> : null}
          <div className="test">
            <label>
              Time of ban(in ms)
              <br />
              <input
                type="text"
                name="time"
                value={time}
                className="input-join"
                onChange={handleChange}
              />
            </label>
          </div>
          <button className="add" onClick={handleBan}>
            Ban
          </button>
        </form>
      </div>
    );
  }

  const handleBanForm = async () => {
    if (banForm) setBanForm(false);
    else setBanForm(true);
  };

  function OpeBtn() {
    const [state, setState] = useState({
      senderIsOpe: false,
      targetIsOpe: false,
    });
    const channel = takeActiveCanal();

    useEffect(() => {
      async function IsOpe() {
        const channelB = channel.substring(1);
        const sendUsername =
          apiBaseURL +
          "chat-controller/channel/ope/" +
          channelB +
          "/" +
          username;
        const sendTarget =
          apiBaseURL + "chat-controller/channel/ope/" + channelB + "/" + usr;
        const info = await axios.get(sendUsername, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const bis = await axios.get(sendTarget, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setState({ senderIsOpe: info.data, targetIsOpe: bis.data });
      }
      IsOpe().then();
    }, []);

    return (
      <>
        {isHere && state.senderIsOpe && username !== usr ? (
          !state.targetIsOpe ? (
            <button className="chat-buttons" onClick={handleAddOpe}>
              Add operator
            </button>
          ) : (
            <button className="chat-buttons" onClick={handleSubOpe}>
              Sub operator
            </button>
          )
        ) : (
          <></>
        )}
      </>
    );
  }

  function Buttons() {
    const [me, setMe] = useState(false);

    useEffect(() => {
      const keyPress = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          if (buttons) {
            setButtons(false);
            if (banForm) setBanForm(false);
          }
        }
      };

      async function isUsrInChan() {
        let canal = takeActiveCanal();
        if (canal[0] === "#") canal = canal.slice(1);
        await axios
          .get(apiBaseURL + "chat-controller/channelName/" + canal, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          .then((res) => {
            if (res.data.users.includes(usr)) setIsHere(true);
            else setIsHere(false);
          })
          .catch((error) => {
            console.log(error);
          });
      }
      isUsrInChan();

      async function getOpeList() {
        let name = takeActiveCanal();
        if (name === defaultChannelGen) return ;
        if (name[0] === "#") name = name.slice(1);
        await axios
          .get(apiBaseURL + "chat-controller/channelName/" + name, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          .then((res) => {
            if (!res.data) return;
            if (res.data.operator.includes(payload.nickname)) setIsOpe(true);
            if (res.data.ban.includes(usr)) setIsBan(true);
            if (res.data.mute.includes(usr)) setIsMute(true);
          })
          .catch((error) => {
            console.log(error);
          });
      }
      getOpeList();

      if (usr === payload.nickname) setMe(true);
      document.addEventListener("keydown", keyPress);
      return () => document.removeEventListener("keydown", keyPress);
    }, []);

    return (
      <div className="buttons-form">
        <form method="get" onSubmit={handleButtonForm}>
          <h4>
            Choose your action <br /> on {usr}
          </h4>
          <div className="ctn-btn-action">
            {isHere && !me && (
              <button className="chat-buttons" onClick={handleBlock}>
                Block
              </button>
            )}
            {isHere && !me && isOpe && (
              <button className="chat-buttons" onClick={handleKick}>
                Kick
              </button>
            )}
            {isHere && !me && isOpe && !isBan && (
              <button className="chat-buttons" onClick={handleBanForm}>
                Ban
              </button>
            )}
            {isHere && !me && isOpe && !isMute && (
              <button className="chat-buttons" onClick={handleMute}>
                Mute
              </button>
            )}
            {isHere && !me && isOpe && isMute && (
              <button className="chat-buttons" onClick={handleUnMute}>
                UnMute
              </button>
            )}
            {!isHere && !me && isOpe && isBan && (
              <button className="chat-buttons" onClick={handleUnBan}>
                UnBan
              </button>
            )}
            <Link to={`/profile/${usr}`}>
              <button className="chat-buttons">Profile</button>
            </Link>
            <OpeBtn />
            {banForm && <Ban />}
          </div>
        </form>
      </div>
    );
  }

  function ChatMap({ messages }: { messages: ChatInterface[] }) {
    const [channelName, setChannelName] = useState("");

    useEffect(() => {
      
      async function actifCanal() {
        let channel = takeActiveCanal();
        if (channel[0] !== '#') {
          let addressInfo = apiBaseURL + "chat-controller/channel/private/" + channel + "/" + username;
          await axios.get(addressInfo, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          .then((response) => {
            setChannelName(response.data)
          });
        }
        else
        setChannelName(channel);
      }
      actifCanal();

      if (channelName === defaultChannelGen && messages.length === 0)
        fetchMessage(channelName);
         
      function scrollbar(){
        const scr = document.getElementById("rcv-mess-container");
        if (scr) scr.scrollTop += scr.clientHeight;
      }

      scrollbar()
    },);
    
    return (
      <>
        <ul className="list-msg-container">
          {messages
            .filter((messages) =>
              channelName
                ? messages.channel === channelName
                : messages.channel === takeActiveCanal()
            )
            .map((messages) =>
              messages.emitter === username ? (
                <li className="Emt" key={messages.id}>
                  <div
                    className="contain-emt"
                    onClick={() => {
                      handleButton(messages.emitter);
                    }}
                  >
                    {messages.emitter}
                  </div>
                  <div className="contain-msg">{messages.content}</div>
                </li>
              ) : messages.emitter === "announce" ? (
                <li className="Announce" key={messages.id}>
                  <div className="contain-ann-msg">{messages.content}</div>
                </li>
              ) : messages.emitter === "server" ? (
                <li className="Serv" key={messages.id}>
                  <div className="contain-serv-msg">{messages.content}</div>
                </li>
              ) : (
                <li className="Rcv" key={messages.id}>
                  <div
                    className="contain-emt"
                    onClick={() => {
                      handleButton(messages.emitter);
                    }}
                  >
                    {messages.emitter}
                  </div>
                  <div className="contain-msg">{messages.content}</div>
                </li>
              )
            )}
        </ul>
      </>
    );
  }

  /////////////////////////////////////JOIN////////////////////
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
    };

    function handleChange(e: any) {
      e.preventDefault();

      setErrorInput("");

      const value = e.target.value;
      setState({
        ...state,
        [e.target.name]: value,
      });
    }

    const sendForm = (channel: string, password: string, type: string) => {
      if (channel.indexOf("#") === -1) channel = "#" + channel;
      const sendJoin = {
        username: username,
        channel: channel,
        password: password,
        type: type,
      };
      ChatClientSocket.joinChannel(sendJoin);
      const msg = "test";
      setJoinForm(false);
    };

    const handleSubmitJoin = async (e: React.SyntheticEvent) => {
      e.preventDefault();

      if (!state.channel || !state.channel[0]) {
        setErrorInput("Enter a channel Name");
      }
      if (state.channel[0]) {
        for (let i = 0; state.channel[i]; i++) {
          if (state.channel[i] === "#") {
            setErrorInput("Can't contain '#'.");
            return;
          }
        }
      }
      if (state.pwd[0]) {
        const exists = await axios.get(
          apiBaseURL +
            "chat-controller/channel/find/" +
            state.channel +
            "/" +
            state.pwd
            , {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
        if (
          exists.data.status === 404 &&
          exists.data.name === "NotFoundException"
        )
          sendForm(state.channel, state.pwd, state.selectedOption);
        else if (
          exists.data.status === 404 &&
          exists.data.name === "NotFoundException"
        )
          setErrorInput("Password mismatch.");
      } else {
        const exists = await axios.get(
          apiBaseURL + "chat-controller/channel/findName/" + state.channel
          , {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        if (
          exists.data.status === 404 &&
          exists.data.name === "NotFoundException"
        )
          sendForm(state.channel, state.pwd, state.selectedOption);
        else if (
          exists.data.status === 404 &&
          exists.data.name === "NotFoundException"
        )
          setErrorInput("Password mismatch.");
      }
    };

    const options = [
      { value: "public", label: "Public" },
      { value: "private", label: "Private" },
      { value: "protected", label: "Protected" },
    ];

    return (
      <div className="join-form">
        <form method="get" onSubmit={handleSubmitJoin}>
          <h4>Join a Channel</h4>
          <div className="test">
            {errorInput && <p className="error"> {errorInput} </p>}
            <Select
              defaultValue={options[0]}
              onChange={handleSelect}
              options={options}
            />
            <label>
              Channel
              <br />
            </label>
            <input
              type="text"
              name="channel"
              value={state.channel}
              className="input-join"
              onChange={handleChange}
            />
          </div>
          <div>
            <label>
              Password
              <br />
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
    );
  }

  ////////////////////////////////////////INVITATION///////////////////////////////////
  function Invitation(props: { canal: string }) {
    const [buttonInvitation, setButtonInvitation] = useState(false);
    const [usersList, setUsersList] = useState([]);

    const setBtnInvit = () => {
      if (buttonInvitation) setButtonInvitation(false);
      else {
        setButtonInvitation(true);
      }
    };

    // const keyPress = (event: KeyboardEvent) => {
    //   if (event.key === "Escape") {
    //     setMessagePrivateForm(false);
    //   }
    // };

    // useEffect(() => {
    //   document.addEventListener("keydown", keyPress);
    //   return () => document.removeEventListener("keydown", keyPress);
    // });

    useEffect(() => {
      async function requUser() {
        const url = apiBaseURL + "user";
        await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          setUsersList(response.data);
        });
      }
      requUser();
    }, []);

    const handleInvite = (target: string) => {
      decoded = jwt_decode(localStorage.getItem("token")!);  
      const id = decoded?.id
      const sendInv = { channel: takeActiveCanal(), target: target, id:  id};
      ChatClientSocket.inviteToChannel(sendInv);
      setButtonInvitation(false);
    };

    function ListUsers() {
      const list = usersList.map((user: any) =>
        username !== user.nickname ? (
          <div className="li-prv" key={user.nickname}>
            <button
              className="btn-handle-prv"
              onClick={() => handleInvite(user.nickname)}
            >
              <Avatar size={"50px"} img={user.avatarUrl} />
              {user.nickname}
            </button>
          </div>
        ) : (
          <div className="li-prv" key={user.nickname}></div>
        )
      );

      return (
        <div className="pop-invite">
          <h4>Invite in channel</h4>
          <div className="chat-list-ctnr">{list}</div>
        </div>
      );
    }
    if (props.canal[0] !== "#" || props.canal === "#general") {
      return <></>;
    } else {
      return (
        <>
          <button className="button-chat" onClick={setBtnInvit}>
            <img
              className="logo-chat"
              src={InvLogo}
              alt="Invite Message"
              title={"Invite Message"}
            />
          </button>
          {buttonInvitation && <ListUsers />}
        </>
      );
    }
  }

  ///////////////////////////////////////PRV MESSAGE////////////////////////////////
  function PrivateMessage() {
    const btnPrv = () => {
      messagePrivateForm
        ? setMessagePrivateForm(false)
        : setMessagePrivateForm(true);
      setButtons(false);
      setJoinForm(false);
    };

    const handlePrivate = () => {
      const sendPrv = { username: username, target: usr };
      ChatClientSocket.privateMessage(sendPrv);
    };

    return (
      <>
        <button className="button-chat" onClick={btnPrv}>
          <img
            className="logo-chat"
            src={PrvLogo}
            alt="Private Message"
            title={"Private Message"}
          />
        </button>
        {messagePrivateForm && <AffPrivateMessage />}
      </>
    );
  }

  function AffPrivateMessage() {
    const [usersList, setUsersList] = useState([]);

    const keyPress = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMessagePrivateForm(false);
      }
    };

    useEffect(() => {
      document.addEventListener("keydown", keyPress);
      return () => document.removeEventListener("keydown", keyPress);
    });

    useEffect(() => {
      async function requUser() {
        const url = apiBaseURL + "user";
        await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          setUsersList(response.data);
        });
      }
      requUser();
    }, []);

    const handlePrivate = (target: string) => {
      setMessagePrivateForm(false);
      const sendPrv = { username: username, target: target };
      ChatClientSocket.privateMessage(sendPrv);
    };

    function ListUsers() {
      const list = usersList.map((user: any) =>
        username !== user.nickname ? (
          <div className="li-prv" key={user.nickname}>
            <button
              className="btn-handle-prv"
              onClick={() => handlePrivate(user.nickname)}
            >
              <Avatar size={"50px"} img={user.avatarUrl} />
              {user.nickname}
            </button>
          </div>
        ) : (
          <div className="li-prv" key={user.nickname}></div>
        )
      );

      return <div className="chat-list-ctnr">{list}</div>;
    }

    return (
      <div className="pop-private">
        <h4>Private Message</h4>
        <ListUsers />
      </div>
    );
  }

  //////////////////////////////////////JOIN//////////////////////////////
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
      if (joinForm) setJoinForm(false);
      else {
        setJoinForm(true);
        setButtons(false);
        setMessagePrivateForm(false);
      }
    };

    return (
      <>
        <button className="button-chat" onClick={handleJoin}>
          <img className="logo-chnl" src={joinButton}></img>
        </button>
        {joinForm && <JoinForm />}
      </>
    );
  }

  const sendMessage = () => {
    if (
      inputRef.current &&
      inputRef.current.value &&
      inputRef.current.value[0]
    ) {
      const cmd = choiceCmd(inputRef.current.value);
      doCmd(cmd, inputRef.current.value);
      inputRef.current.value = "";
    }
  };

  useEffect(() => {

    const messageCallBack = async (data: { sender: string, msg: string, channel: string }) => {
      await fetchMessage(takeActiveCanal());
    }

    ChatClientSocket.onMessageRecieve(messageCallBack)
    if (!channelList.includes(defaultChannelGen)) {
      const send = { username: username, channel: defaultChannelGen };
      ChatClientSocket.joinChatServer(send);
    }

    const joinCallBack = (room: string) => {
      if (room[0] !== '#')
        room.indexOf(username) === 0 ? room = room.substring(username.length) : room = room.substring(0, room.length - username.length);
      if (!channelList.includes(room)) {
        channelList.push(room);
        setRoomChange(room);
        const canal = document.getElementById("canal");
        if (canal)
          canal.innerHTML = room;
      }
    }

    ChatClientSocket.onJoinChan(joinCallBack);

    const blockedCallBack = (target: string) => {
      if (!blocedList.includes(target))
        blocedList.push(target);
    }

    ChatClientSocket.addBlockCb(blockedCallBack);

    /*const wasBlockedCallBack = (target: string) => {
      //Pour que les messages se reload par celui bloque
    }*/

    //ChatClientSocket.addWasBlockCb(blockedCallBack);

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
    };

    ChatClientSocket.addQuitCb(quitCallBack);

    const inviteCallBack = (data: { username: string; target: string }) => {
      if (data.target === username) {
        if (!channelList.includes(data.username)) {
          channelList.push(data.username);
          setRoomChange(data.username);
          const canal = document.getElementById("canal");
          //if (canal) canal.innerHTML = data.username;
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
    };

    ChatClientSocket.addInvCb(inviteCallBack);

    const errCallBack = (data: { channel: string; reason: string }) => {
      setErrorMessage({ channel: data.channel, error: data.reason });
    };

    ChatClientSocket.addErr(errCallBack);

    return () => {
      ChatClientSocket.offJoinChan(joinCallBack);
      ChatClientSocket.offBlock(blockedCallBack);
      ChatClientSocket.offQuit(quitCallBack);
      ChatClientSocket.offInv(inviteCallBack);
      ChatClientSocket.offMessageRecieve(messageCallBack);
      ChatClientSocket.offErr(errCallBack);
    };
  }, [roomChange]);

  function choiceCmd(input: string): string {
    if (input.indexOf("/") === 0) {
      if (input.indexOf(" ") !== -1)
        return input.substring(0, input.indexOf(" "));
      return input;
    }
    return "/msg";
  }
  
  async function fetchMessage(channelFetch : string){
    if (channelFetch[0] !== '#') {
      let addressInfo = apiBaseURL + "chat-controller/message/" + channelFetch + "/" + username;
      await axios.get(addressInfo, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then(response => {
          setMessages(response.data);
        })
      }
    else {
      channelFetch = channelFetch.substring(1);
      let addressInfo = apiBaseURL + "chat-controller/message/channel/" + channelFetch + "/" + username;
      await axios.get(addressInfo , {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(response => {
        setMessages(response.data);
        });
      }
    }

  async function doCmd(cmd: string, msg: string) {
    let channel = takeActiveCanal();
    const send = { username: username, channel: channel, msg: msg }
    ChatClientSocket.send(send);
    fetchMessage(channel);
  }

  async function handleStringChange(newString: string) {
    setRoomChange(newString);
    fetchMessage(takeActiveCanal());
  }
    
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chat-div">
      <h1>Chat</h1>
      <div className="chat">
        <div className="chat-container">
          <div className="list">
            <ChannelList
              channelList={channelList}
              onStringChange={handleStringChange}
            />
          </div>
          <div className="chat-line">
            <Join />
            <PrivateMessage />
            <Invitation canal={takeActiveCanal()} />
          </div>
          {buttons && <Buttons />}
          <div className="chat-line">
            <h3 id="canal">{defaultChannelGen}</h3>
            <Param canal={takeActiveCanal()} />
            <Quit canal={takeActiveCanal()} />
          </div>
          
          <div id="rcv-mess-container">
            <ChatMap messages={messages} />
          </div>
          <div className="send-mess-container">
            <input
              className="input-chat-principal"
              id="focus-principal-chat"
              ref={inputRef}
              onKeyDown={handleKeyDown}
              type="text"
            />
            <button className="btn-chat-principal" onClick={sendMessage}>
              Send
            </button>
          </div>
        </div>
        <div className="user-lists">
          <UsersList messages={messages} channel={takeActiveCanal()} />
        </div>
        <ErrorModalChat
          msg={errorMessage}
          onClose={() => setErrorMessage({ channel: "", error: "" })}
        />
      </div>
    </div>
  );
}
