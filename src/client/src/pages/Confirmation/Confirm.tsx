import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../components/Auth/auth.context";
import { useFetcher } from "../../hooks/UseFetcher";

async function ValidateEmail() {
  const { setAuthed } = React.useContext(AuthContext);
  const { put, showErrorInModal } = useFetcher();

  const location = useLocation();
  const id = location.search.substring(1);

  put<string>("auth/get-token/" + id, {})
    .then(newToken => {
      localStorage.setItem("token", newToken);
      setAuthed(true);
    })
    .catch((error) => {
      showErrorInModal(error);
      return <Navigate to={"/"} />;
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

  ValidateEmail();

  return (
    <div style={home}>
      <h3>Email Confirmed!</h3>
      <h4 style={title}>
        Thanks for joining us! You can now return to the game by clicking on the
        play button. You can close the other page.
      </h4>
    </div>
  );
}
