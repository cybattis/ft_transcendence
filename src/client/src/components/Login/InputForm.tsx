import React from "react";

function capitalizeFirstLetter(string: String) {
  return string[0].toUpperCase() + string.slice(1);
}

interface LabelProps {
  name: string;
  type: string;
}

export default function InputForm(props: LabelProps) {
  const inputStyle = {
    display: "flex",
    flexDirection: "row" as "row",
    boxSizing: "border-box" as "border-box",
    alignItems: "center",

    padding: "10px 14px",
    gap: "8px",

    width: "358px",
    height: "46px",

    color: "var(--black)",
    background: "white",
    borderRadius: "8px",
    border: "none",
    outline: 0,
  };

  const name = capitalizeFirstLetter(props.name);

  return (
    <label>
      {name} <br />
      <input style={inputStyle} type={props.type} name={props.name} />
    </label>
  );
}
