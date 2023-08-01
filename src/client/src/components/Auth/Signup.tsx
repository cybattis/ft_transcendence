import React, {useContext, useState} from "react";
import axios from "axios";
import Logo from "../Logo/Logo";
import InputForm from "../InputForm/InputForm";
import "./Auth.css";
import validator from "validator";
import {apiBaseURL} from "../../utils/constant";
import logo42 from "../../resource/logo-42.png";
import {MessageModal} from "../Modal/MessageModal";
import {ErrorContext} from "../Modal/modalContext";
import {FormContext, FormState} from "./form.context";

interface UserCredential {
  nickname: string;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
}

export default function Signup() {
  const { setFormState } = useContext(FormContext);
  const { setErrorMessage } = useContext(ErrorContext);
  const [errorInput, setErrorInput] = useState("");
  const [message, setMessage] = useState("");

  const inputs = {
    nickname: "",
    firstname: "",
    lastname: "",
    email: "",
    confirmEmail: "",
    password: "",
    confirmPassword: "",
  };

  const changeInputs = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    inputs.nickname = e.currentTarget.nickname.value;
    inputs.firstname = e.currentTarget.firstname.value;
    inputs.lastname = e.currentTarget.lastname.value;
    inputs.email = e.currentTarget.email.value;
    inputs.confirmEmail = e.currentTarget.confirmEmail.value;
    inputs.password = e.currentTarget.password.value;
    inputs.confirmPassword = e.currentTarget.confirmPassword.value;
  };

  const inUse = async (input: string, value: string): Promise<boolean> => {
    const { data } = await axios.get(
      apiBaseURL + "user/check/" + input + "/" + value
    );
    return !!data; // if data existe return true sinon false
  };

  const validateInput = async () => {
    let isValid = true;
    if (!inputs.nickname) {
      setErrorInput("Please enter a Nickname.");
      isValid = false;
    } else if (!validator.isAlpha(inputs.nickname)) {
      setErrorInput("Can't have any special chracters in your Nickname.");
      isValid = false;
    } else if (inputs.nickname.length > 15) {
      setErrorInput("Nickname is too long. (max 15 characters)");
      isValid = false;
    } else if (await inUse("login", inputs.nickname)) {
      setErrorInput("Nickname already in use.");
      isValid = false;
    } else if (!inputs.email) {
      setErrorInput("Please enter an Email.");
      isValid = false;
    } else if (!validator.isEmail(inputs.email)) {
      setErrorInput("Please enter a valid Email.");
      isValid = false;
    } else if (await inUse("email", inputs.email)) {
      setErrorInput("Email already in use.");
      isValid = false;
    } else if (inputs.confirmEmail && inputs.email !== inputs.confirmEmail) {
      setErrorInput("Email and Confirm Email does not match.");
      isValid = false;
    } else if (!inputs.confirmEmail) {
      setErrorInput("Please enter a Confirm Email.");
      isValid = false;
    } else if (inputs.email && inputs.confirmEmail !== inputs.email) {
      setErrorInput("Email and Confirm Email does not match.");
      isValid = false;
    } else if (!inputs.password) {
      setErrorInput("Please enter a Password.");
      isValid = false;
    } else if (
      (inputs.confirmPassword && inputs.password !== inputs.confirmPassword) ||
      (inputs.password && inputs.confirmPassword !== inputs.password)
    ) {
      setErrorInput("Password and Confirm Password does not match.");
      isValid = false;
    } else if (!inputs.confirmPassword) {
      setErrorInput("Please enter a Confirm Password.");
      isValid = false;
    }
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    await changeInputs(e);
    if (!(await validateInput())) return;

    const user: UserCredential = {
      nickname: inputs.nickname,
      firstname: inputs.firstname,
      lastname: inputs.lastname,
      email: inputs.email,
      password: inputs.password,
    };

    await axios
      .post(apiBaseURL + "auth/signup", user, {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      })
      .then(() => {
        setMessage("Please check your email to confirm your account");
      })
      .catch((error) => {
        if (error.response === undefined) {
          localStorage.clear();
          setErrorMessage("Error unknown...");
        } else setErrorMessage(error.response.data.message + "!");
      });
  };

  const intraLink = process.env["REACT_APP_REDIR_URL"];

  return (
    <div className="background">
      {message ? (
        <MessageModal
          msg={message}
          onClose={() => {
            setMessage("");
            setFormState(FormState.NONE);
          }}
        />
      ) : (
        <div className="authForm">
          <Logo />
          <div className="desc">Join the Fever</div>
          {errorInput ? <p className="error"> {errorInput} </p> : null}
          <form method="post" onSubmit={handleSubmit}>
            <InputForm type="text" name="nickname" />
            <div className="halfInput">
              <InputForm
                type="text"
                name="firstname"
                label="First name"
                half={true}
              />
              <InputForm
                type="text"
                name="lastname"
                label="Last name"
                half={true}
              />
            </div>
            <InputForm type="text" name="email" />
            <InputForm type="text" name="confirmEmail" label="Confirm Email" />
            <InputForm type="password" name="password" />
            <InputForm
              type="password"
              name="confirmPassword"
              label="Confirm Password"
            />
            <button type="submit" className="submitButton">
              Signup
            </button>
          </form>
          <a className="link42" href={intraLink}>
            <div>Signup with</div>
            <img src={logo42} alt="42 logo" width={32} height={32} />
          </a>
          <div className="authFooter">
            <div>Already have an account?</div>
            <button
              className="bottomLink"
              onClick={() => {
                setFormState(FormState.LOGIN);
              }}
            >
              Sign in!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}