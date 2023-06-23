import "./Settings.css";
import { Avatar } from "../../components/Avatar";
import axios from "axios";
import { ChangeEvent, FormEvent, useContext, useState } from "react";
import InputForm from "../../components/InputForm";
import { UserSettings } from "../../type/user.type";
import { ErrorModal } from "../../components/Error/ErrorModal";
import { Navigate, useLoaderData } from "react-router-dom";
import { AuthContext } from "../../components/Auth/dto";
import { HandleTokenError } from "../../utils/handleFetchError";

export function Settings() {
  const data = useLoaderData() as UserSettings;
  const token = localStorage.getItem("token");
  const { setAuthToken } = useContext(AuthContext);

  let [nickname, setNickname] = useState(data.nickname);
  let [firstName, setFirstName] = useState(data.firstname);
  let [lastName, setLastName] = useState(data.lastname);
  let [avatarUrl, setAvatarUrl] = useState(data.avatarUrl);
  let [tfa, setTfa] = useState(data.authActivated);

  let [error, setError] = useState("");

  if (token === null) {
    setAuthToken(null);
    return <Navigate to={"/"} />;
  }

  function submitImage(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files === null) return;
    console.log("File: ", event.target.files[0]);
    if (event.target.files[0].size > 2097152) {
      setError("File has to be less than 2MB");
      return;
    }
    const formData = new FormData();
    formData.append("avatar", event.target.files[0]);

    axios
      .post(`http://localhost:5400/user/upload/avatar`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          token: token,
        },
      })
      .then((res) => {
        console.log("image uploaded: ", res.data);
        setAvatarUrl(res.data);
      })
      .catch((error) => {
        if (error.response.status === 403) {
          return <HandleTokenError />;
        } else {
          console.log(error.response.data.message);
          setError(error.response.data.message + "!");
        }
      });
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const user: UserSettings = {
      nickname: nickname,
      firstname: firstName,
      lastname: lastName,
    };

    await axios
      .put("http://localhost:5400/user/update", user, {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          token: token,
        },
      })
      .then(() => {})
      .catch((error) => {
        if (error.response.status === 403) {
          return <HandleTokenError />;
        } else {
          console.log(error.response.data.message);
          setError(error.response.data.message + "!");
        }
      });
  };

  const handle2fa = async () => {
    await axios
      .put(
        "http://localhost:5400/user/update/2fa",
        {},
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            token: token,
          },
        }
      )
      .then((res) => {
        console.log(res);
        setTfa(!tfa);
      })
      .catch((error) => {
        if (error.response.status === 403) {
          return <HandleTokenError />;
        } else {
          console.log("Error: ", error);
          setError("Server error... try again");
        }
      });
  };

  return (
    <div className={"settingPage"}>
      <ErrorModal error={error} onClose={() => setError("")} />
      <div className={"settingPage_title"}>Settings</div>
      <div className={"settingPage_container"}>
        <div className={"settingPage_avatar"}>
          <Avatar size="200px" img={avatarUrl} />
          <button onClick={() => document?.getElementById("avatar")?.click()}>
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
            {!tfa ? "Activate 2FA" : "Deactivate 2FA"}
          </button>
        </div>
      </div>
    </div>
  );
}
