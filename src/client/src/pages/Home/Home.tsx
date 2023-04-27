import "./Home.css";
import { useOutletContext } from "react-router-dom";

function HomeUnlogged() {
  return (
    <div className="home">
      <h1>PongFever</h1>
      <h3 className="desc">
        Come play to the new and fun multiplayer pong game !
      </h3>
      <div className="game"></div>
    </div>
  );
}

function HomeLogged() {
  //TODO: fetch relevant user data

  return (
    <div className="home">
      <h1>I'm Logged !!!!!!!!!!</h1>
    </div>
  );
}

export default function Home() {
  const contextData = useOutletContext();

  return (
    <div className="full">
      {contextData === false ? <HomeUnlogged /> : <HomeLogged />}
    </div>
  );
}
