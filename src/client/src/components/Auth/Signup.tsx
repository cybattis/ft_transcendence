import React from "react";
import Logo from "../Logo/Logo";
import "./Auth.css";
import InputForm from "../InputForm";

export default function Signup() {
  return (
    <div className="background">
      <div className="authForm">
        <Logo />
        <div className="desc">Join the Fever</div>
        <form method="post">
          <InputForm type="text" name="nickname" />
          <div className="halfInput">
            <InputForm
              type="text"
              name="firstName"
              label="First name"
              half={true}
            />
            <InputForm
              type="text"
              name="LastName"
              label="Last name"
              half={true}
            />
          </div>
          <InputForm type="text" name="email" />
          <InputForm type="password" name="password" />
          <InputForm
            type="password"
            name="confirmPwd"
            label="Confirm password"
          />
          <button type="submit" className="submitButton">
            Signup
          </button>
        </form>
        <a
          className="link42"
          href="https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-edf712168eec4256ee4f78ca683cdc411e0d71b7cafcff73b1876feb3f229d47&redirect_uri=http%3A%2F%2F127.0.0.1%3A3000%2F&response_type=code"
          target="_blank"
          rel="noopener noreferrer"
        >
          Signup with 42
        </a>

        <div className="authFooter">
          <div>Already have an account?</div>
          <a className="link" href="blank" target="_blank">
            Sign in!
          </a>
        </div>
      </div>
    </div>
  );
}
