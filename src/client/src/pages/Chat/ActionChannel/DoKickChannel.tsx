import { useForm } from "react-hook-form";
import "./FormAction.css";
import kick from "../../../resource/kick.svg";
import React from "react";

export default function DoKickChannel({ onSubmit }: any) {
  const { register, handleSubmit, reset } = useForm();
  let channelElement = document.getElementById("container-create-channel");
  let operatorElement = document.getElementById("container-operator-channel");
  let privateElement = document.getElementById("container-private-message");
  let banElement = document.getElementById("container-ban-channel");
  let kickElement = document.getElementById("container-kick-channel");
  let blockedElement = document.getElementById("container-blocked-users");
  function blocKickMessage() {
    let focus = document.getElementById("focus-kick");
    if (kickElement && focus) {
      if (kickElement.style.display === "block") close();
      else {
        if (
          channelElement &&
          operatorElement &&
          banElement &&
          privateElement &&
          blockedElement
        ) {
          channelElement.style.display = "none";
          banElement.style.display = "none";
          operatorElement.style.display = "none";
          privateElement.style.display = "none";
          blockedElement.style.display = "none";
        }
        kickElement.style.display = "block";
        focus.focus();
      }
    }
  }

  function close() {
    if (kickElement) kickElement.style.display = "none";
    reset();
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") close();
  };

  return (
    <div id="container-all-kick">
      <div onClick={blocKickMessage} className="button-action-form">
        <img className="logo-chat" src={kick} alt="Kick" title={"Kick"} />
      </div>
      <div id="container-kick-channel">
        <button className={"button-close-cmd"} onClick={close}>
          X
        </button>
        <h4 className={"cmd-container-channel"}>Kick</h4>
        <form
          className="form-action"
          onSubmit={handleSubmit((data) => {
            onSubmit(data.target);
            close();
          })}
        >
          <input
            id="focus-kick"
            className="input-form-command"
            {...register("target")}
            placeholder={"Target"}
          />
          <input className="submit-button-form" type="submit" value="Submit" />
        </form>
      </div>
    </div>
  );
}
