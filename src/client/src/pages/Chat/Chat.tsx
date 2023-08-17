import React, { useEffect, useRef, useState } from "react";
import "./Chat.css";
import ChannelList from "./List/ChannelList";
import { TokenData } from "../../type/client.type";
import jwt_decode from "jwt-decode";
import Select from "react-select";
import { ChatClientSocket } from "./Chat-client";
import joinButton from "../../resource/more-logo.png";
import { Link, Navigate } from "react-router-dom";
import { Avatar } from "../../components/Avatar";
import UsersList from "./List/UsersList";
import { ErrorModalChat } from "../../components/Modal/PopUpModal";
import ParamLogo from "../../resource/param-logo.png";
import PrvLogo from "../../resource/message-logo.png";
import QuitLogo from "../../resource/quit-logo.png";
import InvLogo from "../../resource/invite-logo.png";
import { useFetcher } from "../../hooks/UseFetcher";
import { Channel, Chat, UserFriendsData, UserInfo } from "../../type/user.type";
import { Fetching } from "../../utils/fetching";
import {useProfileData} from "../../hooks/UseProfileData";

const defaultChannelGen: string = "#general";
const channelList: string[] = [];

export default function ChatClient() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [roomChange, setRoomChange] = useState("");
  const [messages, setMessages] = useState<Chat[]>([]);
  const blocedList: string[] = [];
  const [joinForm, setJoinForm] = useState(false);
  const [banForm, setBanForm] = useState(false);
  const [messagePrivateForm, setMessagePrivateForm] = useState(false);
  const [buttons, setButtons] = useState(false);
  const [usr, setUsr] = useState("");
  const [isOpe, setIsOpe] = useState(false);
  const [isBan, setIsBan] = useState(false);
  const [isMute, setIsMute] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [isHere, setIsHere] = useState(false);
  const [inGeneral, setInGeneral] = useState(true);
  const [owner, setOwner] = useState(false);
  const [allChannels, setAllChannels] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState({
    channel: "",
    error: "",
  });
  const { get, put, showErrorInModal } = useFetcher();

  const token = localStorage.getItem("token");
  let payload: TokenData;
  let username = "";

  if (username === "" && token) {
    try {
      payload = jwt_decode(token);
      if (payload?.nickname) username = payload.nickname;
    } catch (e) {
      console.log(`Decode error ${e}`);
    }
  }

  function takeActiveCanal(): string {
    const canal = document.getElementById("canal");
    return canal ? canal.innerHTML : defaultChannelGen;
  }

  function Quit(props: { canal: string }) {
    const handleQuitButton = () => {
      const sendQuit = {
        cmd: "quit",
        username: username,
        channel: props.canal,
      };
      ChatClientSocket.quit(sendQuit);
    };

    return (
      <>
        <button className="button-chat" onClick={handleQuitButton}>
          <img
            className="logo-chat"
            src={QuitLogo}
            alt="Quit Channel"
            title={"Quit channel"}
          />
        </button>
      </>
    );
  }

  function Param(props: { canal: string }) {
    const [buttonParam, setButtonParam] = useState(false);
    const { get } = useFetcher();
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
          <form
            className="form-param"
            method="get"
            onSubmit={handleSubmitParam}
          >
            <Select
              className="selectName"
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
            <button type="submit" className="submitParamButton">
              Change
            </button>
          </form>
        </div>
      );
    }

    const keyPress = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (buttonParam) setButtonParam(false);
      }
    };

    useEffect(() => {
      async function isOwner() {
        if (props.canal[0] != "#") {
          setOwner(false);
          return;
        }
        const channelB = channel.substring(1);
        const sendOwner =
          "chat-controller/channel/owner/" +
          channelB +
          "/" +
          username;
        try {
          const bool = await get<boolean>(sendOwner);
          bool ? setOwner(true) : setOwner(false);
        } catch (error) {} // Silently fail
      }

      isOwner();

      document.addEventListener("keydown", keyPress);
      return () => document.removeEventListener("keydown", keyPress);
    });

    const btnParam = () => {
      buttonParam ? setButtonParam(false) : setButtonParam(true);
    };

      return (
        <>
          {owner && <button className="button-chat" onClick={btnParam}>
            <img
              className="logo-chat"
              src={ParamLogo}
              alt="Param"
              title={"Channel Param"}
            />
          </button>}
          {buttonParam && <AffParam />}
        </>
      );
  }

  const handleButton = (user: string) => {
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

  const handleBlock = () => {
    const sendBlock = { target: usr };
    ChatClientSocket.blocked(sendBlock);
    put<UserFriendsData>(`user/block-user/${usr}`, {})
      .catch(showErrorInModal);
  };

  const handleUnBlock = async () => {
    const sendBlock = { target: usr };
    ChatClientSocket.blocked(sendBlock);
    put<UserFriendsData>(`user/unblockUsr/${usr}`, {})
      .then(res => {
        for (let i = 0; blocedList[i]; i ++) {
          if (blocedList[i] === usr)
            blocedList.splice(i, 1);
        }
      })
      .catch(showErrorInModal);
  };

  const handleAddOpe = () => {
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

  function Buttons() {
    const [targetOp, setTargetOp] = useState(false);
    const [me, setMe] = useState(true);
    const userData = useProfileData();

    useEffect(() => {
      function getMyNickname() {
        if (userData.data === null) return;

        if (usr === userData.data.nickname) {
          if (!me)
            setMe(true);
        } else if (usr !== userData.data.nickname)
          setMe(false);
      }

      getMyNickname();
    }, [userData.data]);

      const keyPress = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          if (buttons) {
            setButtons(false);
            if (banForm) setBanForm(false);
          }
        }
      };

    useEffect(() => {
      async function isUsrInChan() {
        let canal = takeActiveCanal();
        if (canal[0] === "#") canal = canal.slice(1);

        get<Channel | null>("chat-controller/channelName/" + canal)
          .then(channel => {
            if (channel && channel.users.includes(usr)) setIsHere(true);
            else setIsHere(false);
          })
          .catch(() => {});
      }
      isUsrInChan();

      async function getOpeList() {
        let name = takeActiveCanal();
        if (name === defaultChannelGen) return;
        if (name[0] === "#") name = name.slice(1);

        get<Channel | null>("chat-controller/channelName/" + name)
          .then(channel => {
            if (!channel) return;
            if (channel.operator.includes(payload?.nickname)) setIsOpe(true);
            if (channel.ban.includes(usr)) setIsBan(true);
            if (channel.mute.includes(usr)) setIsMute(true);
          })
          .catch(() => {});
      }
      getOpeList();

      async function getBlockedUsrs() {
          get<string[]>("user/blockedList")
          .then((res) => {
            setBlocked(false);
            if (res.includes(usr))
              setBlocked(true);
          })
          .catch((error) => {
            console.log(error);
          });
      }
      getBlockedUsrs();

      async function IsOpe() {
        const channel = takeActiveCanal();
        const channelB = channel.substring(1);
        const sendTarget = "chat-controller/channel/ope/" + channelB + "/" + usr;
        get<boolean>(sendTarget)
        .then((response) => {
          if (targetOp !== response)
            setTargetOp(response);
        });
      }
      IsOpe();

      document.addEventListener("keydown", keyPress);
      return () => document.removeEventListener("keydown", keyPress);
    }, []);


    if (me === true)
    {
      return (
        <div className="buttons-form">
          <form method="get" onSubmit={handleButtonForm}>
            <h4 className="title-form-chat">
              Choose your action on {usr}
            </h4>
            <div className="ctn-btn-action">
              <Link to={`/profile/${usr}`}>
                <button className="chat-buttons">Profile</button>
              </Link>
            </div>
          </form>
        </div>
      )
    }

    return (
      <div className="buttons-form">
        <form method="get" onSubmit={handleButtonForm}>
          <h4 className="title-form-chat">
            Choose your action on {usr}
          </h4>
          <div className="ctn-btn-action">
            {!me && isHere && !blocked && (
              <button className="chat-buttons" onClick={handleBlock}>
                Block
              </button>
            )}
            {!me && isHere && isOpe && (
              <button className="chat-buttons" onClick={handleKick}>
                Kick
              </button>
            )}
            {!me && isHere && isOpe && !isBan && (
              <button className="chat-buttons" onClick={handleBanForm}>
                Ban
              </button>
            )}
            {!me && isHere && isOpe && !isMute && (
              <button className="chat-buttons" onClick={handleMute}>
                Mute
              </button>
            )}
          </div>
          <div className="ctn-btn-action">
            {!me && isHere && isOpe && isMute && (
              <button className="chat-buttons" onClick={handleUnMute}>
                UnMute
              </button>
            )}
            {!me && !isHere && isOpe && isBan && (
              <button className="chat-buttons" onClick={handleUnBan}>
                UnBan
              </button>
            )}
            {!me && isHere && blocked && (
              <button className="chat-buttons" onClick={handleUnBlock}>
                UnBlock
              </button>
            )}
            {!me && isOpe && isHere && !targetOp && (
              <button className="chat-buttons" onClick={handleAddOpe}>
                Add operator
              </button>
            )}
            {!me && isOpe && isHere && targetOp && (
              <button className="chat-buttons" onClick={handleSubOpe}>
                Sub operator
              </button>
            )}
            <Link to={`/profile/nickname/${usr}`}>
              <button className="chat-buttons">Profile</button>
            </Link>
          </div>
          {banForm && <Ban />}
        </form>
      </div>
    );
  }

  function ChatMap({ messages }: { messages: Chat[] }) {
    const [channelName, setChannelName] = useState("");

    useEffect(() => {
      async function actifCanal() {
        let channel = takeActiveCanal();
        if (channel[0] !== "#") {
          let addressInfo =
            "chat-controller/channel/private/" +
            channel +
            "/" +
            username;

          get<string | null>(addressInfo)
            .then(response => {
              if (response) setChannelName(response);
            })
            .catch(() => {});
        } else setChannelName(channel);
      }
      actifCanal();

      //fetchMessage(channelName);

      function scrollbar() {
        const scr = document.getElementById("rcv-mess-container");
        if (scr) scr.scrollTop += scr.clientHeight;
      }

      scrollbar();
    });

    return (
      <>
        <ul className="list-msg-container">
          {messages
            .filter((messages) =>
              blocedList
               ? !blocedList.includes(messages.emitter)
               : !isMute
              &&
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
        try {
          await get<true>(
            "chat-controller/channel/find/" +
            state.channel +
            "/" +
            state.pwd);
        } catch (error) {
          if (!Fetching.isFetchingError(error))
            return;

          if (error.isRequestError()) {
            if (error.code === 404)
              sendForm(state.channel, state.pwd, state.selectedOption);
            else if (error.code === 400)
              setErrorInput("Password mismatch.");
          } else if (error.isServerError()) {
            setErrorInput("Server busy, try again later");
          } else if (error.isTransportError()) {
            setErrorInput("Network error, try again later");
          }
        }

      } else {
        try {
          await get<true>("chat-controller/channel/findName/" + state.channel);
        } catch (error) {
          if (!Fetching.isFetchingError(error))
            return;

          if (error.isRequestError()) {
            if (error.code === 404)
              sendForm(state.channel, state.pwd, state.selectedOption);
            else if (error.code === 400)
              setErrorInput("Password mismatch.");
          } else if (error.isServerError()) {
            setErrorInput("Server busy, try again later");
          } else if (error.isTransportError()) {
            setErrorInput("Network error, try again later");
          }
        }
      }
    };

    const options = [
      { value: "public", label: "Public" },
      { value: "private", label: "Private" },
      { value: "protected", label: "Protected" },
    ];

    return (
      <div className="join-form">
        <form method="get" className="join-form-form" onSubmit={handleSubmitJoin}>
          <h4>Join a Channel</h4>
          <div className="test">
            {errorInput && <p className="error"> {errorInput} </p>}
            <Select
              className="selectName"
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
    const [usersList, setUsersList] = useState<UserInfo[]>([]);

    const keyPress = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (buttonInvitation) setButtonInvitation(false);
      }
    };

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
        get<UserInfo[]>("user")
          .then(users => setUsersList(users))
          .catch(() => {});
      }
      requUser();

      document.addEventListener("keydown", keyPress);
      return () => document.removeEventListener("keydown", keyPress);
    }, [buttonInvitation]);

    const handleInvite = (target: string) => {
      const id = payload?.id;
      const sendInv = { channel: takeActiveCanal(), target: target, id: id };
      ChatClientSocket.inviteToChannel(sendInv);
      setButtonInvitation(false);
    };

    console.log("BTN VALUE: ", buttonInvitation);

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
    const [usersList, setUsersList] = useState<UserInfo[]>([]);

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
        get<UserInfo[]>("user")
          .then(users => setUsersList(users))
          .catch(() => {});
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
    const getChan = async () => {
      const channel = takeActiveCanal();
      console.log(channel);
      if (channel[0] === '#' && channel !== "#general")
      {
        if (inGeneral)
          setInGeneral(false);
      }
      else if (!inGeneral && (channel === "#general" || channel[0] !== '#'))
        setInGeneral(true);
    }
    getChan();

    const fetchAllChannels = async () => {
      get<string[]>('user/myChannels')
        .then((response) => {
          setAllChannels(response);
        }).catch(showErrorInModal);
    }

    fetchAllChannels();

    const messageCallBack = async (data: {
      sender: string;
      msg: string;
      channel: string;
    }) => {
      await fetchMessage(takeActiveCanal());
    };

    ChatClientSocket.onMessageRecieve(messageCallBack);
    if (!channelList.includes(defaultChannelGen)) {
      const send = { username: username, channel: defaultChannelGen };
      ChatClientSocket.joinChatServer(send);
    }

    const joinCallBack = (room: string) => {
      if (room[0] !== "#")
        room.indexOf(username) === 0
          ? (room = room.substring(username.length))
          : (room = room.substring(0, room.length - username.length));
      if (!channelList.includes(room)) {
        channelList.push(room);
        setRoomChange(room);
        const canal = document.getElementById("canal");
        if (canal) canal.innerHTML = room;
      }
    };

    ChatClientSocket.onJoinChan(joinCallBack);

    const blockedCallBack = (target: string) => {
      if (!blocedList.includes(target)) blocedList.push(target);
    };

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

    fetchMessage(takeActiveCanal());

    return () => {
      ChatClientSocket.offJoinChan(joinCallBack);
      ChatClientSocket.offBlock(blockedCallBack);
      ChatClientSocket.offQuit(quitCallBack);
      ChatClientSocket.offInv(inviteCallBack);
      ChatClientSocket.offMessageRecieve(messageCallBack);
      ChatClientSocket.offErr(errCallBack);
    };
  }, [roomChange]);

  if (!token) {
    return <Navigate to={"/"} />;
  }

  function choiceCmd(input: string): string {
    if (input.indexOf("/") === 0) {
      if (input.indexOf(" ") !== -1)
        return input.substring(0, input.indexOf(" "));
      return input;
    }
    return "/msg";
  }

  async function fetchMessage(channelFetch: string) {
    if (channelFetch[0] !== "#") {
      let addressInfo = "chat-controller/message/" + channelFetch + "/" + username;

      await get<Chat[]>(addressInfo)
        .then(chats => setMessages(chats))
        .catch(() => {});

    } else {
      channelFetch = channelFetch.substring(1);
      let addressInfo =
        "chat-controller/message/channel/" +
        channelFetch +
        "/" +
        username;
      await get<Chat[]>(addressInfo)
        .then(chats => setMessages(chats))
        .catch(() => {});
    }
  }

  async function doCmd(cmd: string, msg: string) {
    let channel = takeActiveCanal();
    const send = { username: username, channel: channel, msg: msg };
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
              channelList={allChannels}
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
            {!inGeneral && <Quit canal={takeActiveCanal()} />}
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
          <UsersList
            messages={messages}
            channel={takeActiveCanal()}
            handleButton={handleButton}
          />
        </div>
        <ErrorModalChat
          msg={errorMessage}
          onClose={() => setErrorMessage({ channel: "", error: "" })}
        />
      </div>
    </div>
  );
}
