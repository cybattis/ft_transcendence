import "./PopUpModal.css";
import { MouseEvent, useContext, useRef, useState } from "react";
import { PopupContext } from "./Popup.context";
import { Link, Navigate } from "react-router-dom";

export function ErrorModal(props: { onClose: () => void }) {
  const { errorMessage } = useContext(PopupContext);
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={ref}
      onClick={(event: MouseEvent) => {
        if (event.target === ref.current) {
          props.onClose();
        }
      }}
    >
      {errorMessage ? (
        <dialog id={"error-modal"} open>
          <p>{errorMessage}</p>
          <form method="dialog">
            <button id="close" onClick={props.onClose}>
              X
            </button>
          </form>
        </dialog>
      ) : null}
    </div>
  );
}

export function InfoModal(props: { onClose: () => void }) {
  const { infoMessage } = useContext(PopupContext);
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={ref}
      onClick={(event: MouseEvent) => {
        if (event.target === ref.current) {
          props.onClose();
        }
      }}
    >
      {infoMessage ? (
        <dialog id={"info-modal"} open>
          <p>{infoMessage}</p>
          <form method="dialog">
            <button id="close" onClick={props.onClose}>
              X
            </button>
          </form>
        </dialog>
      ) : null}
    </div>
  );
}

export function GameNotFoundModal(props: { text: string, onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  if (props.text === "")
    return null;

  return (
    <div
      ref={ref}
      onClick={(event: MouseEvent) => {
        if (event.target === ref.current) {
          props.onClose();
        }
      }}
    >
      <div id="info-modal-centered">
        <dialog id="info-modal-centered-inner" open>
          <p>{props.text}</p>
          <form method="dialog">
            <button id="close" onClick={props.onClose}>
              X
            </button>
          </form>
        </dialog>
      </div>
    </div>
  );
}

export function ErrorModalChat(props: {
  msg: { channel: string; error: string };
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={ref}
      onClick={(event: MouseEvent) => {
        if (event.target === ref.current) {
          props.onClose();
        }
      }}
    >
      {props.msg.error ? (
        <dialog id={"error-modal"} open>
          <p>{props.msg.channel}</p>
          <p>{props.msg.error}</p>
          <form method="dialog">
            <button id="close" onClick={props.onClose}>
              X
            </button>
          </form>
        </dialog>
      ) : null}
    </div>
  );
}

export function EndGamePopup(props: { hasWin: boolean }) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      className={"end-game-modal"}
      ref={ref}
      onClick={(event: MouseEvent) => {
        if (event.target === ref.current) {

        }
      }}
    >
      <dialog id={"win-game-popup"} open>
        {props.hasWin ? <div>YOU WIN!</div> : <div>YOU LOOSE!</div>}
        <form method="dialog">
          <Link
            to={"/"}
            id="close"
            className={"go-home-button"}
          >
            Go home
          </Link>
        </form>
      </dialog>
    </div>
  );
}
