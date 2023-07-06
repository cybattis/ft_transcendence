import React, { useContext, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import "../../components/Auth/Auth.css";
import { FormContext } from "../../components/Auth/dto";

export default function TFARedirection() {
  const { codeForm, setCodeForm } = useContext(FormContext);
  const location = useLocation();
  const email = location.search.substring(1);
  localStorage.setItem("email", email);

  useEffect(() => {
    if (!codeForm && localStorage.getItem("email") !== null) {
      setCodeForm(true);
    }
  }, []);

  return <Navigate to={"/"} />;
}
