import "./About.css";

export default function About() {
  function DevCard(props: {
    name: string;
    avatar: string;
    description: string;
    left: boolean;
  }) {
    const sides = props.left ? "about-left" : "about-right";

    return (
      <div className={sides}>
        {props.left ? (
          <>
            <img
              className="about-img"
              src={props.avatar}
              alt={`${props.name}`}
            />
            <div className="about-description">
              <h3 className={"about-dev-title"}>{props.name}</h3>
              <div>{props.description}</div>
            </div>
          </>
        ) : (
          <>
            <div className="about-description">
              <h3 className={"about-dev-title"}>{props.name}</h3>
              <div>{props.description}</div>
            </div>
            <img
              className="about-img"
              src={props.avatar}
              alt={`${props.name}`}
            />
          </>
        )}
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
      <DevCard
        name={"AleFerra"}
        avatar={
          "https://cdn.intra.42.fr/users/0e5626d7311e1883891e2b8fa86be7ef/aleferra.jpg"
        }
        description={
          "Hi! I'm a new developper who started back in November 2021. I love\n" +
          "coding, and I really hope you'll love my projects as much as I love\n" +
          "them. Hope you enjoy your time on our site."
        }
        left={true}
      />
      <DevCard
        name={"Cyril Battistolo (cybattis)"}
        avatar={
          "https://cdn.intra.42.fr/users/b3f8ee7bb338215d8552ec3640a50848/cybattis.jpg"
        }
        description={
          "Hi! I'm a new developper who started back in November 2021. I love\n" +
          "coding, and I really hope you'll love my projects as much as I love\n" +
          "them. Hope you enjoy your time on our site."
        }
        left={false}
      />
      <DevCard
        name={"LFilloux"}
        avatar={
          "https://cdn.intra.42.fr/users/d63ce9134b8d9884388f99647b858944/lfilloux.jpg"
        }
        description={
          "Hi! I'm a new developper who started back in November 2021. I love\n" +
          "coding, and I really hope you'll love my projects as much as I love\n" +
          "them. Hope you enjoy your time on our site."
        }
        left={true}
      />
      <DevCard
        name={"NJennes"}
        avatar={
          "https://cdn.intra.42.fr/users/f2b3296c6a3d2fb97052a4f79b5571f1/njennes.jpg"
        }
        description={
          "Hi! I'm a new developper who started back in November 2021. I love\n" +
          "coding, and I really hope you'll love my projects as much as I love\n" +
          "them. Hope you enjoy your time on our site."
        }
        left={false}
      />
    </div>
  );
}
