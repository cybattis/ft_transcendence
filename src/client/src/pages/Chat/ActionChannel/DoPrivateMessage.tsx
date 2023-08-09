import { useForm } from "react-hook-form";
import "./FormAction.css";
import React from "react";
import operator from "../../../resource/operator.svg";

export default function DoPrivateMessage({ onSubmit }: any) {
  const { register, handleSubmit, reset } = useForm();
  let focus = document.getElementById("focus-prv");
  let kickElement = document.getElementById("container-kick-channel");
  let channelElement = document.getElementById("container-create-channel");
  let operatorElement = document.getElementById("container-operator-channel");
  let privateElement = document.getElementById("container-private-message");
  let banElement = document.getElementById("container-ban-channel");
  let blockedElement = document.getElementById("container-blocked-users");
  function blocPrivateMessage() {
    if (privateElement && operator && focus) {
      if (privateElement.style.display === "block") close();
      else {
        if (
          channelElement &&
          kickElement &&
          operatorElement &&
          banElement &&
          blockedElement
        ) {
          channelElement.style.display = "none";
          banElement.style.display = "none";
          blockedElement.style.display = "none";
          operatorElement.style.display = "none";
          kickElement.style.display = "none";
        }
        privateElement.style.display = "block";
        focus.focus();
      }
    }
  }
  function close() {
    if (privateElement) privateElement.style.display = "none";
    reset();
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") close();
  };

  return (
    <div id="container-all-private">
      <div onClick={blocPrivateMessage} className="button-action-form">
        <img
          className="logo-chat"
          src={operator}
          alt="Private Message"
          title={"Private Message"}
        />
      </div>
      <div id="container-private-message">
        <button className={"button-close-cmd"} onClick={close}>
          X
        </button>
        <h4 className={"cmd-container-channel"}>Message Private</h4>
        <form
          className="form-action"
          onSubmit={handleSubmit((data) => {
            onSubmit(data.target);
            close();
          })}
        >
          <input
            id="focus-prv"
            placeholder={"Target"}
            className="input-form-command"
            {...register("target")}
          />
          <input className="submit-button-form" type="submit" value="Submit" />
        </form>
      </div>
    </div>
  );
}
