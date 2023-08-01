import "./Settings.css";
import {Avatar} from "../../components/Avatar";
import axios from "axios";
import {ChangeEvent, FormEvent, useContext, useEffect, useState} from "react";
import InputForm from "../../components/InputForm/InputForm";
import {UserSettings} from "../../type/user.type";
import {Navigate} from "react-router-dom";
import {MessageModal} from "../../components/Modal/MessageModal";
import {apiBaseURL} from "../../utils/constant";
import {ErrorContext} from "../../components/Modal/modalContext";
import {ErrorResponse} from "../../type/client.type";
import {UserData} from "../Profile/user-data";
import {AuthContext} from "../../components/Auth/auth.context";
import {FormContext, FormState} from "../../components/Auth/form.context";
import ReactLoading from 'react-loading';
import {LoadingPage} from "../Loading/LoadingPage";

export function Settings() {
  const [data, setData] = useState<UserSettings | null>(null);
  const { setAuthed } = useContext(AuthContext);
  const { setErrorMessage } = useContext(ErrorContext);

  useEffect( () => {
    function goToHome() {
      return <Navigate to={"/"}/>;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      goToHome();
      return;
    }

    axios
      .get(apiBaseURL + "user/settings/", {
        headers: {
          Authorization:
            "Bearer " + token,
        },
      })
      .then((res) => {
        setData(res.data);
      })
      .catch((error) => {
        if (error.response === undefined) {
          localStorage.clear();
          setErrorMessage("Error unknown...");
        } else if (error.response.status === 403) {
          localStorage.clear();
          setAuthed(false);
          setErrorMessage("Session expired, please login again!");
        } else setErrorMessage(error.response.data.message + "!");
        return <Navigate to={"/"}/>;
      });
  }, []);

  return data ? <SettingsLoaded data={data} /> : <LoadingPage/>;
}

export function SettingsLoaded({data }: { data: UserSettings }) {
  const token = localStorage.getItem("token");

  const { setAuthed, tfaActivated } = useContext(AuthContext);
  const { setFormState } = useContext(FormContext);
  const { setErrorMessage } = useContext(ErrorContext);

  const [nickname, setNickname] = useState(data.nickname);
  const [firstName, setFirstName] = useState(data.firstname);
  const [lastName, setLastName] = useState(data.lastname);
  const [avatarUrl, setAvatarUrl] = useState(data.avatarUrl);

  const [message, setMessage] = useState("");

  if (token === null) {
    setAuthed(false);
    setErrorMessage("Session expired, please login again!");
    return <Navigate to={"/"} />;
  }

  function submitImage(event: ChangeEvent<HTMLInputElement>) {
    if (!token) {
      setAuthed(false);
      setErrorMessage("Session expired, please login again!");
      return <Navigate to={"/"} />;
    }

    if (event.target.files === null) return;
    if (event.target.files[0].size > 2097152) {
      setErrorMessage("File has to be less than 2MB");
      return;
    }
    const formData = new FormData();
    formData.append("avatar", event.target.files[0]);

    axios
      .post(apiBaseURL + "user/upload/avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setMessage("Avatar updated!");
        setAvatarUrl(res.data);
      })
      .catch((error: ErrorResponse) => {
        if (error.response === undefined) {
          localStorage.clear();
          setErrorMessage("Error unknown...");
        } else if (error.response.status === 403) {
          localStorage.clear();
          setAuthed(false);
          setErrorMessage("Session expired, please login again!");
        } else setErrorMessage(error.response.data.message + "!");
      });
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const user: UserSettings = {
      nickname: nickname,
      firstname: firstName,
      lastname: lastName,
    };

    if (!token) {
      setAuthed(false);
      setErrorMessage("Session expired, please login again!");
      return <Navigate to={"/"} />;
    }

    if (user.nickname.length === 0) {
      setErrorMessage("Your Nickname can't be empty!");
      return;
    } else if (user.nickname.length > 15) {
      setErrorMessage("Your Nickname can't be longer than 15 characters!");
      return;
    }

    await axios
      .put(apiBaseURL + "user/update", user, {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          Authorization: `Bearer ${token}`,
        },
      })
      .then(() => {
        UserData.updateNickname(user.nickname);
        setMessage("Update successful!");
      })
      .catch((error) => {
        if (error.response === undefined) {
          localStorage.clear();
          setErrorMessage("Error unknown...");
        } else if (error.response.status === 403) {
          localStorage.clear();
          setAuthed(false);
          setErrorMessage("Session expired, please login again!");
        } else setErrorMessage(error.response.data.message + "!");
      });
  };

  const handle2fa = async () => {
    if (!token) {
      setAuthed(false);
      setErrorMessage("Session expired, please login again!");
      return <Navigate to={"/"} />;
    }

    await axios
      .put(
        apiBaseURL + "auth/2fa/update",
        {},
        {
          headers: {
            "Access-Control-Allow-Origin": "*",
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        setFormState(FormState.TFA_CODE);
      })
      .catch((error) => {
        if (error.response === undefined) {
          localStorage.clear();
          setErrorMessage("Error unknown...");
        } else if (error.response.status === 403) {
          localStorage.clear();
          setAuthed(false);
          setErrorMessage("Session expired, please login again!");
        } else setErrorMessage(error.response.data.message + "!");
      });
  };

  return (
    <div className={"settingPage"}>
      <MessageModal msg={message} onClose={() => setMessage("")} />
      <div className={"settingPage_title"}>Settings</div>
      <div className={"settingPage_container"}>
        <div className={"settingPage_avatar"}>
          <Avatar size="200px" img={avatarUrl} />
          <button
            className="avatarButton"
            onClick={() => document?.getElementById("avatar")?.click()}
          >
            Change avatar
          </button>
          <input
            className={"settingPage_sendImage"}
            type="file"
            id="avatar"
            name="avatar"
            accept="image/png, image/jpeg"
            alt={"Change avatar"}
            onChange={submitImage}
          />
        </div>
        <div className={"settingPage_form"}>
          <form method="post" onSubmit={handleSubmit}>
            <InputForm
              name={"Nickname"}
              type={"text"}
              value={nickname ?? ""}
              onChange={(event) => {
                setNickname(event.target.value);
              }}
            />
            <InputForm
              name={"First Name"}
              type={"text"}
              value={firstName ?? ""}
              onChange={(event) => {
                setFirstName(event.target.value);
              }}
            />
            <InputForm
              name={"Last Name"}
              type={"text"}
              value={lastName ?? ""}
              onChange={(event) => {
                setLastName(event.target.value);
              }}
            />
            <button type="submit" className="submitButton">
              Update
            </button>
          </form>
          <hr id={"hr1"} />
          <button type="submit" className="submitButton" onClick={handle2fa}>
            {!tfaActivated ? "Activate 2FA" : "Deactivate 2FA"}
          </button>
        </div>
      </div>
    </div>
  );
}
