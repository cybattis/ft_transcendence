import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../../components/Auth/dto";
import { apiBaseURL } from "../../utils/constant";
import { HandleError } from "../../components/HandleError";

async function ValidateEmail() {
  const { setAuthToken } = React.useContext(AuthContext);

  const location = useLocation();
  const id = location.search.substring(1);

  axios
    .put(apiBaseURL + "auth/" + id, true)
    .then((res) => {
      console.log(res.data);
      const data = res.data;
      localStorage.setItem("token", data);
      setAuthToken(data);
  })
    .catch((err) => {
      return <HandleError error={err} />;
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

  ValidateEmail().catch((err) => {
    console.log(err);
    return <Navigate to={"/"} />;
  });

  return (
    <div style={home}>
      <h3>Email Confirmed!</h3>
      <h4 style={title}>
        Thanks for joining us! You can now return to the game by clicking on the play button.
        You can close the other page.
      </h4>
    </div>
  );
}
