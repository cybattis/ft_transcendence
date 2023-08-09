import "./PopUpModal.css";
import { MouseEvent, useContext, useRef } from "react";
import { PopupContext } from "./Popup.context";

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
