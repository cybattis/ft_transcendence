import React from "react";
import Image from "../resource/avatar-placeholder.jpg";

export interface AvatarProps {
  img?: string;
  size: string;
}

export function Avatar(props: AvatarProps) {
  const style = {
    borderRadius: "50%",
    width: props.size,
  };

  return <img style={style} src={props.img ? props.img : Image} alt="avatar" />;
}
