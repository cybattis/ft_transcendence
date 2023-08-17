import React, { useContext } from "react";
import "./Auth.css";
import InputForm from "../InputForm/InputForm";
import validator from "validator";
import Logo from "../Logo/Logo";
import logo42 from "../../resource/logo-42.png";
import { AuthContext } from "./auth.context";
import { FormContext, FormState } from "./form.context";
import { useFetcher } from "../../hooks/UseFetcher";
import Config from "../../utils/Config";

interface SigninDto {
  email: string;
  password: string;
}

export default function Login() {
  const [errorMessage, setErrorMessage] = React.useState("");
  const { setFormState } = useContext(FormContext);
  const { setAuthed } = useContext(AuthContext);
  const { post, showErrorInModal } = useFetcher();
  const inputs: SigninDto = {
    email: "",
    password: "",
  };

  const changeInputs = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    inputs.email = e.currentTarget.email.value;
    inputs.password = e.currentTarget.password.value;
  };

  const validateInput = async () => {
    let isValid = true;
    if (!inputs.email) {
      setErrorMessage("Please enter an Email.");
      isValid = false;
    } else if (!validator.isEmail(inputs.email)) {
      setErrorMessage("Please enter a valid Email.");
      isValid = false;
    } else if (!inputs.password) {
      setErrorMessage("Please enter a Password.");
      isValid = false;
    }
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    await changeInputs(e);
    if (!(await validateInput())) return;

    const user: SigninDto = {
      email: inputs.email,
      password: inputs.password,
    };

    post<string>("auth/signin", user)
      .then((newToken) => {
        if (newToken === "code") {
          localStorage.setItem("email", user.email);
          setFormState(FormState.TFA_CODE);
        } else {
          localStorage.setItem("token", newToken);
          setAuthed(true);
          setFormState(FormState.NONE);
        }
      })
      .catch(showErrorInModal);
  };

  const intraLink = Config.redir_url;

  return (
    <div className="background">
      <div className="authForm">
        <Logo />
        <div className="desc">Sign in to your account</div>
        {errorMessage && <p className="error"> {errorMessage} </p>}
        <form method="post" onSubmit={handleSubmit}>
          <InputForm type="text" name="email" />
          <br />
          <InputForm type="password" name="password" />
          <button type="submit" className="submitButton">
            Login
          </button>
        </form>
        <a className="link42" href={intraLink}>
          <div>Login with</div>
          <img src={logo42} alt="42 logo" width={32} height={32} />
        </a>
        <div className="authFooter">
          <div>New to PongFever?</div>
          <button
            className="bottomLink"
            onClick={() => {
              setFormState(FormState.SIGNUP);
            }}
          >
            Sign up!
          </button>
        </div>
      </div>
    </div>
  );
}
