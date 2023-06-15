import "./Settings.css";
import { Avatar } from "../../components/Avatar";
import axios from "axios";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import InputForm from "../../components/InputForm";
import { UserSettings } from "../../type/user.type";

export function Settings() {
  // TODO: check token validity
  const token = localStorage.getItem("token");

  let [nickname, setNickname] = useState("");
  let [firstName, setFirstName] = useState("");
  let [lastName, setLastName] = useState("");
  let [email, setEmail] = useState("");
  let [avatarUrl, setAvatarUrl] = useState("");
  let [tfa, setTfa] = useState(false);

  let [error, setError] = useState("");

  useEffect(() => {
    async function fetchData(token: string) {
      if (token === null) return;
      console.log("fetch setting");
      console.log("token: ", token);
      await axios
        .get(`http://localhost:5400/user/settings/${token}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })
        .then((response) => {
          console.log(response.data);
          setNickname(response.data.nickname);
          setFirstName(response.data.firstname);
          setLastName(response.data.lastname);
          setEmail(response.data.email);
          setAvatarUrl(response.data.avatarUrl);
          setTfa(response.data.authActivated);
        });
    }

    fetchData(token!);
  }, []);

  function submitImage(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files === null) return;
    console.log("File: ", event.target.files[0]);
    if (event.target.files[0].size > 2097152) {
      setError("File too large");
      return;
    }
    const formData = new FormData();
    formData.append("avatar", event.target.files[0]);

    axios
      .post(`http://localhost:5400/user/upload/${token}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => {
        console.log("image uploaded: ", res.data);
        setAvatarUrl(res.data);
      })
      .catch((error) => {
        console.log(error.response.data.message);
        setError(error.response.data.message);
      });
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const user: UserSettings = {
      nickname: nickname,
      firstname: firstName,
      lastname: lastName,
      email: email,
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
        console.log("Error: ", error.response.status);
        setError("Server error... try again");
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
        console.log("Error: ", error.response.status);
        setError("Server error... try again");
      });
  };

  return (
    <div className={"settingPage"}>
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
          {error !== "" ? <div>{error}.</div> : <></>}
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
