import React from "react";
import {Outlet} from "react-router-dom";
import "./App.css";
import NavBar from "./components/NavBar/NavBar";
import Footer from "./components/Footer/Footer";
import {AuthContextProvider} from "./components/Auth/auth.context";
import {FormContextProvider} from "./components/Auth/form.context";
import {AuthForms} from "./components/Auth/Forms";
import { PopupProvider } from "./components/Modal/Popup.context";
import { AcceptGamePopup } from "./components/Modal/AcceptGamePopup";

function App() {

  return (
    <div className="app" id={"background"}>
        <AuthContextProvider>
          <FormContextProvider>
              <PopupProvider>
                <AcceptGamePopup>
                  <NavBar />
                  <Outlet />
                  <AuthForms />
                </AcceptGamePopup>
              </PopupProvider>
          </FormContextProvider>
        </AuthContextProvider>
      <Footer />
    </div>
  );
}

export default App;
