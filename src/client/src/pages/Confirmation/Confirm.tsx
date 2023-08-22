import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../components/Auth/auth.context";
import { useFetcher } from "../../hooks/UseFetcher";

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

  const { setAuthed } = React.useContext(AuthContext);
  const { put, showErrorInModal } = useFetcher();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const uuid = location.search.substring(1);

    put<string>("auth/confirm-user/" + uuid, {})
      .then(newToken => {
        localStorage.setItem("token", newToken);
        setAuthed(true);
      })
      .catch((error) => {
        showErrorInModal(error);
        navigate("/");
      });
  }, []);

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
