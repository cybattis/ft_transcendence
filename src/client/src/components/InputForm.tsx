import React from "react";

function capitalizeFirstLetter(string: String) {
  return string[0].toUpperCase() + string.slice(1);
}

interface LabelProps {
  name: string;
  type: string;
  label?: string;
  half?: boolean;
}

export default function InputForm(props: LabelProps) {
  const inputStyle = {
    display: "flex",
    flexDirection: "row" as "row",
    boxSizing: "border-box" as "border-box",
    alignItems: "center",

    padding: "10px 14px",
    marginBottom: "5px",
    gap: "8px",

    width: props.half ? "174px" : "358px",
    height: "46px",

    color: "var(--black)",
    background: "white",
    borderRadius: "8px",
    border: "none",
    outline: 0,
  };

  const name = capitalizeFirstLetter(props.name);
  const label = props.label ? props.label : name;

  return (
    <label>
      {label} <br />
      <input style={inputStyle} type={props.type} name={props.name}/>
    </label>
  );
}
