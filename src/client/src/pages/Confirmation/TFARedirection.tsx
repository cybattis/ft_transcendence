import React, {useContext, useEffect} from "react";
import {Navigate, useLocation} from "react-router-dom";
import "../../components/Auth/Auth.css";
import {FormContext, FormState} from "../../components/Auth/form.context";

export default function TFARedirection() {
  const { formState, setFormState } = useContext(FormContext);
  const location = useLocation();
  const email = location.search.substring(1);
  localStorage.setItem("email", email);

  useEffect(() => {
    if (formState !== FormState.TFA_CODE && localStorage.getItem("email") !== null) {
      setFormState(FormState.TFA_CODE)
    }
  }, []);

  return <Navigate to={"/"} />;
}
