import { useEffect, useState, useContext } from "react";
import axios from "axios";
import "./Notifications.css";
import { Avatar } from "../../components/Avatar";
import { apiBaseURL } from "../../utils/constant";
import { NotifContext } from "../../components/Auth/dto";
import { Navigate } from "react-router-dom";
import { ErrorContext } from "../../components/Modal/modalContext";
import { AuthContext } from "../../components/Auth/dto";
import { HandleError } from "../../components/HandleError";

export default function Notifications() {
  const { setAuthToken } = useContext(AuthContext);
  const { setErrorMessage } = useContext(ErrorContext);
  const token: string | null = localStorage.getItem("token");
  const { setNotif } = useContext(NotifContext);

  const [invits, setInvits] = useState([
    {
      nickname: "",
      avatarUrl: "",
      id: 0,
    },
  ]);

  async function handleAccept(id: number) {
    if (!id) {
      setAuthToken(null);
      setErrorMessage("Session expired, please login again!");
      return;
    }

    await axios
      .put(apiBaseURL + "/user/accept/" + id, null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        console.log("Accepted");
        removeNotif(id);
      });
  }

  async function handleDecline(id: number) {
    if (!id) {
      setAuthToken(null);
      setErrorMessage("Session expired, please login again!");
      return;
    }

    await axios
      .put(apiBaseURL + "user/decline/" + id, null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        console.log("Decline");
        removeNotif(id);
      });
  }

  async function removeNotif(id: number) {
    const newInvits: any = invits.filter((invits) => invits.id !== id);
    setInvits(newInvits);
  }

  // TODO: check token validity
  useEffect(() => {
    async function fetchFriends() {
      await axios
        .get(apiBaseURL + "user/requested", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          console.log(res.data);
          setInvits(res.data);
          console.log("VALUE: ", invits);
        })
        .catch((err) => {
          return <HandleError error={err} />;
        });
    }
    fetchFriends().then(() => {});
  }, []);

  if (token === null) {
    setAuthToken(null);
    setErrorMessage("Session expired, please login again!");
    return <Navigate to={"/"} />;
  }

  //Faire une map pour afficher toutes invites a la suite
  if (invits && invits[0] && invits[0].id > 0) {
    setNotif(true);
    return (
      <div className="notifPage">
        <h1 className="notifTitle">Notifications</h1>
        <ul className="list">
          {invits.map((invits) => {
            return (
              <div key={invits.id}>
                <div className="notifsElements">
                  <div className="invits">
                    <Avatar size="50px" img={invits.avatarUrl} />
                    <p className="notifText">
                      {invits.nickname} wants to be your Friend!
                    </p>
                    <div className="buttons">
                      <button
                        className="refuse"
                        onClick={() => handleDecline(invits.id)}
                      >
                        <div className="cross"></div>Decline
                      </button>
                      <button
                        className="accept"
                        onClick={() => handleAccept(invits.id)}
                      >
                        <div className="tick-mark"></div>Accept
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </ul>
      </div>
    );
  } else
  setNotif(false);

    return (
      <div className="noNotifTitle">
        <h1>No Notifications</h1>
      </div>
    );
}
