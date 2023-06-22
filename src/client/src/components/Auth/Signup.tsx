import React, { useContext, useState } from "react";
import axios from "axios";
import Logo from "../Logo/Logo";
import InputForm from "../InputForm";
import "./Auth.css";
import validator from "validator";
import { FormContext } from "./dto";

interface UserCredential {
  nickname: string;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
}

export default function Signup() {
  const [errorInput, setErrorInput] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const { setSignupForm, setLoginForm, setCodeForm } = useContext(FormContext);

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
      "http://localhost:5400/user/check/" + input + "/" + value
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
    } else if (inputs.nickname.length > 20) {
      setErrorInput("Nickname is too long. (max 20 characters)");
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
    } else if (!validator.isStrongPassword(inputs.password)) {
      setErrorInput("Password is not strong enough.");
      isValid = false;
    } else if (
      inputs.confirmPassword &&
      inputs.password !== inputs.confirmPassword
    ) {
      setErrorInput("Password and Confirm Password does not match.");
      isValid = false;
    } else if (!inputs.confirmPassword) {
      setErrorInput("Please enter a Confirm Password.");
      isValid = false;
    } else if (inputs.password && inputs.confirmPassword !== inputs.password) {
      setErrorInput("Password and Confirm Password does not match.");
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
      .post("http://localhost:5400/auth/signup", user, {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      })
      .then(() => {
        setSignupForm(false);
        alert(
          "An email has been sent to verify your email address. Please check this out before continuing."
        );
      })
      .catch((error) => {
        console.log("Error: ", error.response.status);
        setErrorMessage("Server error... try again");
      });
  };

  //remettre alert email

  return (
    <div className="background">
      <div className="authForm">
        <Logo />
        <div className="desc">Join the Fever</div>
        {errorInput ? (
          <p className="error"> {errorInput} </p>
        ) : errorMessage ? (
          <p className="error"> {errorMessage} </p>
        ) : null}
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
        <a
          className="link42"
          href="https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-3bcfa58a7f81b3ce7b31b9059adfe58737780f1c02a218eb26f5ff9f3a6d58f4&redirect_uri=http%3A%2F%2F127.0.0.1%3A5400%2Fauth%2F42&response_type=code"
          rel="noopener noreferrer"
        >
          Signup with 42
        </a>
        <div className="authFooter">
          <div>Already have an account?</div>
          <button
            className="link"
            onClick={() => {
              setSignupForm(false);
              setLoginForm(true);
              setCodeForm(false);
            }}
          >
            Sign in!
          </button>
        </div>
      </div>
    </div>
  );
}
