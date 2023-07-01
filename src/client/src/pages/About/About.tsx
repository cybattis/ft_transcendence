import { AuthContext } from "../../components/Auth/dto";
import { useContext } from "react";
import { ErrorContext } from "../../components/Modal/modalContext";

export default function About() {
  const token = localStorage.getItem("token");
  const { setAuthToken } = useContext(AuthContext);
  const { setErrorMessage } = useContext(ErrorContext);

  if (token === null && setAuthToken !== null) {
    setAuthToken(null);
    setErrorMessage("Session expired, please login again!");
  }

  return (
    <div>
      <h1>Team !</h1>
      <p>the team</p>
    </div>
  );
}
