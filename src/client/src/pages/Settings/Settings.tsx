import "./Settings.css";
import { Avatar } from "../../components/Avatar";
import axios from "axios";
import { ChangeEvent, FormEvent, useContext, useState } from "react";
import InputForm from "../../components/InputForm";
import { UserSettings } from "../../type/user.type";
import { Navigate, useLoaderData } from "react-router-dom";
import { AuthContext } from "../../components/Auth/dto";
import FaCode from "../../components/Auth/2fa";
import { MessageModal } from "../../components/Modal/MessageModal";
import { apiBaseURL } from "../../utils/constant";
import { ErrorContext } from "../../components/Modal/modalContext";
import { ErrorResponse } from "../../type/client.type";
import { HandleError } from "../../components/HandleError";

export function Settings() {
  const data = useLoaderData() as UserSettings;
  const token = localStorage.getItem("token");

  const { setAuthToken } = useContext(AuthContext);
  const { setErrorMessage } = useContext(ErrorContext);

  const [codeForm, setCodeForm] = useState(false);
  const [nickname, setNickname] = useState(data.nickname);
  const [firstName, setFirstName] = useState(data.firstname);
  const [lastName, setLastName] = useState(data.lastname);
  const [avatarUrl, setAvatarUrl] = useState(data.avatarUrl);
  const [tfaState, setTfaState] = useState(data.authActivated);

  const [message, setMessage] = useState("");

  if (token === null) {
    setAuthToken(null);
    setErrorMessage("Session expired, please login again!");
    return <Navigate to={"/"} />;
  }

  function submitImage(event: ChangeEvent<HTMLInputElement>) {
    if (!token) {
      setAuthToken(null);
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
          token: token,
        },
      })
      .then((res) => {
        setMessage("Avatar updated!");
        setAvatarUrl(res.data);
      })
      .catch((error: ErrorResponse) => {
        return <HandleError error={error} />;
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
      setAuthToken(null);
      setErrorMessage("Session expired, please login again!");
      return <Navigate to={"/"} />;
    }

    if (!user.nickname[0]) {
      setErrorMessage("Your Nickname can't be empty!");
      return;
    }

    await axios
      .put(apiBaseURL + "user/update", user, {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          token: token,
        },
      })
      .then(() => {
        setMessage("Update successful!");
      })
      .catch((error) => {
        return <HandleError error={error} />;
      });
  };

  const handle2fa = async () => {
    if (!token) {
      setAuthToken(null);
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
            token: token,
          },
        }
      )
      .then((res) => {
        setCodeForm(true);
      })
      .catch((error) => {
        return <HandleError error={error} />;
      });
  };

  return (
    <div className={"settingPage"}>
      {codeForm ? (
        <FaCode
          showCallback={setCodeForm}
          callback={setTfaState}
          callbackValue={!tfaState}
        />
      ) : null}
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
            {!tfaState ? "Activate 2FA" : "Deactivate 2FA"}
          </button>
        </div>
      </div>
    </div>
  );
}
