import React, {useContext, useState} from "react";
import {Outlet} from "react-router-dom";
import "./App.css";
import NavBar from "./components/NavBar/NavBar";
import Footer from "./components/Footer/Footer";
import {AuthContextProvider} from "./components/Auth/auth.context";
import {FormContextProvider} from "./components/Auth/form.context";
import {AuthForms} from "./components/Auth/Forms";
import {ErrorModal} from "./components/Modal/ErrorModal";
import {defaultErrorContext, ErrorContext} from "./components/Modal/modalContext";

function App() {
  const [errorMessage, setErrorMessage] = useState(
    defaultErrorContext.errorMessage
  );

  return (
    <div className="app" id={"background"}>
      <ErrorContext.Provider value={{ errorMessage, setErrorMessage }}>
        <AuthContextProvider>
          <FormContextProvider>
            <NavBar />
            <Outlet />
            <AuthForms />
            <ErrorModal error={errorMessage} onClose={() => setErrorMessage("")}/>
          </FormContextProvider>
        </AuthContextProvider>
      </ErrorContext.Provider>
      <Footer />
    </div>
  );
}

export default App;
