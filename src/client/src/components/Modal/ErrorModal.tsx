import "./ErrorModal.css";
import { useRef, MouseEvent } from "react";

export function ErrorModal(props: { error: string; onClose: () => void }) {
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
      {props.error ? (
        <dialog id={"error-modal"} open>
          <p>{props.error}</p>
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

export function ErrorModalChat(props: { msg :{channel : string; error: string}; onClose: () => void }) {
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