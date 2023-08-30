import { Link } from "react-router-dom";
import { Navigation } from "../../utils/navigation";
import React from "react";

export type PageLinkProps = {
  children?: React.ReactNode;
  to: string;
  className?: string;
  id?: string;
  onClick?: () => void;
}

export function PageLink(props: PageLinkProps) {
  function callback() {
    Navigation.handlePageChange()
      .then(() => {
        if (props.onClick)
          props.onClick();
      })
      .catch((e) => {
        if (props.onClick)
          props.onClick();
      });
  }

  return (
    <Link to={props.to} className={props.className} id={props.id} onClick={callback}>
      {props.children}
    </Link>
  );
}