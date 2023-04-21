import RightMenu from "./RightMenu";
import LeftMenu from "./LeftMenu";
import {AuthProps} from "../../pages/Home/Home";

export default function NavBar(authProps: AuthProps) {
  const navStyle = {
    display: "flex",
    "flex-direction": "row",
    height: "3.5em",

    "font-weight": "bold",
    "align-items": "center",
  };

  const obj = {
    loginCallback: authProps.loginCallback,
    signupCallback: authProps.signupCallback,
  }

  return (
    <nav style={navStyle}>
      <LeftMenu />
      <RightMenu loginCallback={authProps.loginCallback} signupCallback={authProps.signupCallback}/>
    </nav>
  );
}
