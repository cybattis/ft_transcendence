import NavBar from "../../components/NavBar/NavBar";
import Footer from "../../components/Footer/Footer";
import "./Home.css";

export default function Home() {
  return (
    <div className="full">
      <NavBar />
      <div className="home">
        <div>
          <h1>PongFever</h1>
          <h3 className="desc">
            Come play to the new and fun multiplayer pong game !
          </h3>
        </div>
        <div className="game"></div>
      </div>
      <Footer />
    </div>
  );
}
