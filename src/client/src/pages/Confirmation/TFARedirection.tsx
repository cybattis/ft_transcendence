import React, { useContext } from "react";
import { FormContext } from "../../components/Auth/dto";
import { Navigate, useLocation } from "react-router-dom";
import "../../components/Auth/Auth.css";

export default function TFARedirection() {
  const { setCodeForm } = useContext(FormContext);

  const location = useLocation();
  const email = location.search.substring(1);
  localStorage.setItem("email", email);
  setCodeForm(true);

  return <Navigate to={"/"} />;
}
