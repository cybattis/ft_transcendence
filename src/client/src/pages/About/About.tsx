import "./About.css";

export default function About() {
  function DevCard(props: {
    name: string;
    login: string;
    avatar: string;
  }) {
    return (
          <div className={"about-dev-card"}>
            <img
              className="about-img"
              src={props.avatar}
              alt={`${props.name}`}
            />
            <div className="about-description">
              <h3 className={"about-dev-title"}>{props.name}</h3>
              <h3>{props.login}</h3>
            </div>
          </div>
    );
  }

  return (
    <div className="about-page">
      <h1 className="about-main-title">Our Dev Team</h1>
      <h4 className="about-title">
        We are a group of 4 students, studying at 42 Lyon, and we are really
        happy to present you our last Project.
      </h4>
      <div className="about-dev-cards">
          <DevCard
            name={"Alexis Ferrand"}
            login={"aleferra"}
            avatar={
              "https://cdn.intra.42.fr/users/0e5626d7311e1883891e2b8fa86be7ef/aleferra.jpg"
            }
          />
          <DevCard
            name={"Cyril Battistolo"}
            login={"cybattis"}
            avatar={
              "https://cdn.intra.42.fr/users/b3f8ee7bb338215d8552ec3640a50848/cybattis.jpg"
            }
          />
          <DevCard
            name={"Louis Filloux"}
            login={"lfilloux"}
            avatar={
              "https://cdn.intra.42.fr/users/d63ce9134b8d9884388f99647b858944/lfilloux.jpg"
            }
          />
          <DevCard
            name={"Nathan Jennes"}
            login={"njennes"}
            avatar={
              "https://cdn.intra.42.fr/users/f2b3296c6a3d2fb97052a4f79b5571f1/njennes.jpg"
            }
          />
      </div>
    </div>
  );
}
