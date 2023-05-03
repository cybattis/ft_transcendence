import { KeyboardEvent, useCallback } from "react";

function Tabs() {
  const tabs = {
    display: "flex",
    flexDirection: "row" as "row",
    flex: "auto",
    boxSizing: "border-box" as "border-box",
    gap: "20px",
  };

  return (
    <div style={tabs}>
      <div>Global</div>
      <div>Game</div>
      <div>Private</div>
    </div>
  );
}

function MessageList() {
  const chatBox = {
    display: "flex",
    flex: "auto",
    boxSizing: "border-box" as "border-box",
  };

  return <div style={chatBox}></div>;
}

export function Chat() {
  const inputStyle = {
    boxSizing: "border-box" as "border-box",
    display: "flex",

    padding: "0 14px",
    gap: "8px",

    height: "40px",
    width: "100%",

    color: "var(--black)",
    background: "white",
    borderRadius: "8px",
    border: "none",
    outline: 0,
  };

  const onInputKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        console.log("enter");
      }
      console.log(event);
    },
    []
  );

  return (
    <div className="chat">
      <Tabs />
      <MessageList />
      <form>
        <input
          style={inputStyle}
          type="text"
          placeholder="Type here..."
          onKeyDown={onInputKeyDown}
          name="msg"
        />
      </form>
    </div>
  );
}
