import "./MessageModal.css";
import { useRef, MouseEvent } from "react";

export function MessageModal(props: { msg: string; onClose: () => void }) {
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
      {props.msg ? (
        <dialog id={"message-modal"} open>
          <p>{props.msg}</p>
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
