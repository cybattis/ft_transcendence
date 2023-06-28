import React, { useContext } from "react";
import InputForm from "../../../components/InputForm";
import Logo from "../../../components/Logo/Logo";
import "../../../components/Auth/Auth.css"

export default function ChatAction() {

  return (
    <div className="background">
      <div className="authForm">
        <Logo />
        <div className="desc">
          Choose Your Action
        </div>
        <form method="post">
          <InputForm type="text" name="code" />
          <br />
          <button type="submit" className="submitButton">
            Confirm
          </button>
        </form>
      </div>
    </div>
  );
}
