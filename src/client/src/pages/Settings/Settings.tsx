import "./Settings.css";
import { Avatar } from "../../components/Avatar";
import axios from "axios";
import { ChangeEvent, useEffect, useState } from "react";
import { UserSettings } from "../../type/user.type";
import InputForm from "../../components/InputForm";

export function Settings() {
  // TODO: check token validity
  const token = localStorage.getItem("token");

  let [nickname, setNickname] = useState("");
  let [firstName, setFirstName] = useState("");
  let [lastName, setLastName] = useState("");
  let [email, setEmail] = useState("");
  let [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    if (token === null) return;
    console.log("fetch setting");
    async function fetchData(token: string) {
      console.log("token: ", token);
      await axios
        .get(`http://localhost:5400/user/settings/${token}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })
        .then((response) => {
          setNickname(response.data.nickname);
          setFirstName(response.data.firstName);
          setLastName(response.data.lastName);
          setEmail(response.data.email);
          setAvatarUrl(response.data.avatarUrl);
          console.log(response.data);
        });
    }

    fetchData(token!);
  }, []);

  function submitImage(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files === null) return;
    console.log("File: ", event.target.files[0]);
    if (event.target.files[0].size > 4194304) {
      console.log("File too big");
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
        console.log("image uploaded: ", res);
        setAvatarUrl(res.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }

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
        </div>
        <div className={"settingPage_form"}>
          <form method="post">
            <InputForm
              name={"Nickname"}
              type={"text"}
              value={nickname}
              onChange={(event) => {
                setNickname(event.target.value);
              }}
            />
            <InputForm name={"First Name"} type={"text"} value={firstName} />
            <InputForm name={"Last Name"} type={"text"} value={lastName} />
          </form>
          <hr id={"hr1"} />
          <form method="post">
            <InputForm name={"Email"} type={"email"} value={email} />
            <button type="submit" className="submitButton">
              Update email address
            </button>
          </form>
          <hr id={"hr1"} />
          <button type="submit" className="submitButton">
            Update password
          </button>
          <button type="submit" className="submitButton">
            Activate 2FA
          </button>
        </div>
      </div>
    </div>
  );
}
