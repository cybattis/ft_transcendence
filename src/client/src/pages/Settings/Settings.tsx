import "./Settings.css";
import { Avatar } from "../../components/Avatar";
import axios from "axios";
import { ChangeEvent, useEffect, useState } from "react";
import { Decoded } from "../../type/client.type";
import jwt_decode from "jwt-decode";
import { UserSettings } from "../../type/user.type";
import InputForm from "../../components/InputForm";

export function Settings() {
  // TODO: check token validity
  let decoded: Decoded | null = null;

  try {
    decoded = jwt_decode(localStorage.getItem("token")!);
  } catch (e) {
    console.log(e);
  }

  const [data, setData] = useState<UserSettings>({
    id: 0,
    nickname: "",
    avatarUrl: "",
    email: "",
    firstName: "",
    lastName: "",
  });

  useEffect(() => {
    console.log("Token: ", decoded);
    async function fetchData(id: string) {
      await axios
        .get(`http://localhost:5400/user/settings/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })
        .then((response) => {
          setData(response.data);
          console.log(response.data);
        });
    }

    if (decoded !== null) fetchData(decoded.id).then(() => {});
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
      .post(`http://localhost:5400/user/upload/${data.id}`, formData, {
        //TODO: send token
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => {
        console.log("image uploaded: ", res);
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
          <Avatar size="200px" img={data.avatarUrl} />
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
            <InputForm name={"Nickname"} type={"text"} value={data.nickname} />
            <InputForm
              name={"First Name"}
              type={"text"}
              value={data.firstName}
            />
            <InputForm name={"Last Name"} type={"text"} value={data.lastName} />
          </form>
          <hr id={"hr1"} />
          <form method="post">
            <InputForm name={"Email"} type={"email"} value={data.email} />
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
