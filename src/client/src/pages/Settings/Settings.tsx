import "./Settings.css";
import { Avatar } from "../../components/Avatar";
import { ChangeEvent, FormEvent, useContext, useState } from "react";
import InputForm from "../../components/InputForm/InputForm";
import { UserSettings } from "../../type/user.type";
import { UserData } from "../Profile/user-data";
import { AuthContext } from "../../components/Auth/auth.context";
import { FormContext, FormState } from "../../components/Auth/form.context";
import { LoadingPage } from "../Loading/LoadingPage";
import { useData } from "../../hooks/UseData";
import { PopupContext } from "../../components/Modal/Popup.context";
import { useFetcher } from "../../hooks/UseFetcher";

export function Settings() {
  const { data} = useData<UserSettings>("user/settings", true);

  return data ? <SettingsLoaded data={data} /> : <LoadingPage/>;
}

export function SettingsLoaded({data }: { data: UserSettings }) {
  const { tfaActivated } = useContext(AuthContext);
  const { setFormState } = useContext(FormContext);
  const { setErrorMessage, setInfoMessage } = useContext(PopupContext);

  const [nickname, setNickname] = useState(data.nickname);
  const [firstName, setFirstName] = useState(data.firstname);
  const [lastName, setLastName] = useState(data.lastname);
  const [avatarUrl, setAvatarUrl] = useState(data.avatarUrl);

  const { post, put, showErrorInModal } = useFetcher();


  function submitImage(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files === null) return;
    if (event.target.files[0].size > 2097152) {
      setErrorMessage("File has to be less than 2MB");
      return;
    }

    const formData = new FormData();
    formData.append("avatar", event.target.files[0]);

    post<string>("user/upload/avatar", formData, "multipart/form-data")
      .then((res) => {
        setInfoMessage("Avatar updated!");
        setAvatarUrl(res);
      })
      .catch(showErrorInModal);
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const user: UserSettings = {
      nickname: nickname,
      firstname: firstName,
      lastname: lastName,
    };

    if (user.nickname.length === 0) {
      setErrorMessage("Your Nickname can't be empty!");
      return;
    } else if (user.nickname.length > 15) {
      setErrorMessage("Your Nickname can't be longer than 15 characters!");
      return;
    }

      put<UserSettings>("user/update", user, "application/json")
        .then((updatedUser) => {
          UserData.updateNickname(updatedUser.nickname);
          setInfoMessage("Update successful!");
        })
        .catch(showErrorInModal);
  };

  const handle2fa = async () => {
    put<void>("auth/2fa/update", {})
      .then(() => setFormState(FormState.TFA_CODE))
      .catch(showErrorInModal);
  };

  return (
    <div className={"settingPage"}>
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
