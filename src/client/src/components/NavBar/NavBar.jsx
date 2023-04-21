import RightMenu from "./RightMenu";
import LeftMenu from "./LeftMenu";

export default function NavBar() {
  const navStyle = {
    display: "flex",
    "flex-direction": "row",
    height: "3.5em",

    "font-weight": "bold",
    "align-items": "center",
  };

  return (
    <nav style={navStyle}>
      <LeftMenu />
      <RightMenu />
    </nav>
  );
}
