import React from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import jwt_decode from "jwt-decode";
import { AuthContext } from "../../components/Auth/dto";
import { TokenData } from "../../type/user.type";

async function ValidateEmail() {
  const { setAuthToken } = React.useContext(AuthContext);

  const location = useLocation();
  const id = location.search.substring(1);

  await axios.put("http://localhost:5400/auth/" + id, true).then((res) => {
    console.log(res);
    const data = res.data;
    localStorage.setItem("token", data.token);
    setAuthToken(data.token);

    const decoded: TokenData = jwt_decode(data.token);
    localStorage.setItem("id", decoded.id.toString());
  });
}

export default function Confirmation() {
  const home = {
    display: "flex",
    flexDirection: "column" as "column",
    alignItems: "center",
    height: "var(--vp-size)",
  };

  const title = {
    width: "715px",
    height: "112px",
    alignItems: "center",
    textAlign: "center" as "center",
  };

  ValidateEmail().then();

  return (
    <div style={home}>
      <h3>Email Confirmed!</h3>
      <h4 style={title}>
        Thanks for joining us! You can now return to the game and close this
        Page.
      </h4>
    </div>
  );
}
