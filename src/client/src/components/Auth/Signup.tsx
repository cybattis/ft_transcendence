import React from "react";
import axios from 'axios';
import Logo from "../Logo/Logo";
import "./Auth.css";

export default function Signup() {
  const inputStyle = {
    display: "flex",
    flexDirection: "row" as "row",
    boxSizing: "border-box" as "border-box",
    alignItems: "center",

    padding: "10px 14px",
    marginBottom: "5px",
    gap: "8px",

    width: "358px",
    height: "46px",

    color: "var(--black)",
    background: "white",
    borderRadius: "8px",
    border: "none",
    outline: 0,
  };

  const [form, setForm] = React.useState({
    nickname: '',
    firstname: '',
    lastname: '',
    email: '',
    password: '',
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [event.target.id]: event.target.value,
    });
  };

  var body = {
    nickname: form.nickname,
    firstname: form.firstname,
    lastname: form.lastname,
    email: form.email,
    password: form.password,
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    axios.post('http://localhost:5400/auth', body,
    {
      headers: {
      'Content-Type': 'application/json',
      "Access-Control-Allow-Origin": "*",
      }
    })
    .then(res => {
      console.log(res);
    })
    .catch(error => {
      console.log(error);
    });
  }

  return (
    <div className="background">
      <div className="authForm">
        <Logo />
        <div className="desc">Join the Fever</div>
        <form onSubmit={handleSubmit}>
          <label>
            Nickname <br />
            <input style={inputStyle} type="text" name="nickname" id="nickname" value={form.nickname} onChange={handleChange}/> 
          </label>
          <div className="halfInput">
            <label>
              Firstname <br />
              <input
                style={inputStyle}
                type="text"
                name="firstName"
                id="firstname"
                value={form.firstname}
                onChange={handleChange}
              />
            </label>
            <label>
              Lastname <br />
              <input
                style={inputStyle}
                type="text"
                name="lastName"
                id="lastname"
                value={form.lastname}
                onChange={handleChange}
              />
            </label>
          </div>
          <label>
            Email <br />
            <input style={inputStyle} type="text" name="email" id="email" value={form.email} onChange={handleChange}/> 
          </label>
          <label>
            Password <br />
            <input style={inputStyle} type="text" name="password" id="password" value={form.password} onChange={handleChange}/> 
          </label>
          <label>
              Confirm Password <br />
              <input
                style={inputStyle}
                type="text"
                name="confirmpwd"
                //Faire veirfication mdp si deux fois le meme
              />
            </label>
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
          <a className="link" href="blank" target="_blank">
            Sign in!
          </a>
        </div>
      </div>
    </div>
  );
}
