import "./About.css";

export default function About() {
  return (
    <div className="about-page">
      <h1 className="first-title">Our Dev Team</h1>
      <h4 className="title">We are a group of 4 students, studying at 42 Lyon, and we are really happy to present you our last Project.</h4>
      <br />
      <div className="left">
        <img className="img" src={`https://cdn.intra.42.fr/users/0e5626d7311e1883891e2b8fa86be7ef/aleferra.jpg`} />
        <div className="description">
          <h3 className="l-title">AleFerra</h3>
          <div>Hi! I'm a new developper who started back in November 2021. I love coding, and I really hope you'll love my projects as much as I love them. Hope you enjoy your time on our site.</div>
        </div>
      </div>
      <div className="right">
        <div className="description">
          <h3 className="r-title">CyBattis</h3>
          <div>Hi! I'm a new developper who started back in November 2021. I love coding, and I really hope you'll love my projects as much as I love them. Hope you enjoy your time on our site.</div>
        </div>
        <img className="img" src={`https://cdn.intra.42.fr/users/b3f8ee7bb338215d8552ec3640a50848/cybattis.jpg`} />
      </div>
      <div className="left">
        <img className="img" src={`https://cdn.intra.42.fr/users/d63ce9134b8d9884388f99647b858944/lfilloux.jpg`} />
        <div className="description">
          <h3 className="l-title">LFilloux</h3>
          <div>Hi! I'm a new developper who started back in November 2021. I love coding, and I really hope you'll love my projects as much as I love them. Hope you enjoy your time on our site.</div>
        </div>
      </div>
      <div className="right">
        <div className="description">
          <h3  className="r-title">NJennes</h3>
          <div>Hi! I'm a new developper who started back in November 2021. I love coding, and I really hope you'll love my projects as much as I love them. Hope you enjoy your time on our site.</div>
        </div>
        <img className="img" src={`https://cdn.intra.42.fr/users/f2b3296c6a3d2fb97052a4f79b5571f1/njennes.jpg`} />
      </div>
    </div>
  );
}
