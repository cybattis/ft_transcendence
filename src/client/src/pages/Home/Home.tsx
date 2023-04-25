import "./Home.css";

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

export default function Home() {
  return (
    <div className="full">
      <HomeUnlogged />
    </div>
  );
}
