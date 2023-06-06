import React from "react";
import Image from "../resource/avatar-placeholder.jpg";

export interface AvatarProps {
  img?: string;
  size: string;
}

export function Avatar(props: AvatarProps) {
  const style = {
    boxSizing: "border-box" as "border-box",
    borderRadius: "50%",
    height: props.size,
    width: props.size,
    objectFit: "cover" as "cover",
  };

  return <img style={style} src={props.img ? props.img : Image} alt="avatar" />;
}
