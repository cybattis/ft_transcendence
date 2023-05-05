import { ContextType, KeyboardEvent, useCallback, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useSend } from "../../App";

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

function MessageList({ messages }: { messages: string[] }) {
  const chatBox = {
    display: "flex",
    flex: "auto",
    boxSizing: "border-box" as "border-box",
  };

  return (
    <div>
      {messages.map((message, index) => (
        <div key={index}>{message}</div>
      ))}
    </div>
  );
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

  const sendMessage = {
    display: "flex",
    flexDirection: "row" as "row",
  };

  // const onInputKeyDown = useCallback(
  //   (event: KeyboardEvent<HTMLInputElement>) => {
  //     if (event.key === "Enter") {
  //       console.log("enter");
  //     }
  //     console.log(event);
  //   },
  //   []
  // );

  const { send, messages } = useSend();
  const [value, setValue] = useState("");

  return (
    <div className="chat">
      <Tabs />
      <MessageList messages={messages} />
      <div style={sendMessage}>
        <input
          onChange={(e) => {
            setValue(e.target.value);
          }}
          style={inputStyle}
          type="text"
          placeholder="Type here..."
          value={value}
        />
        <button onClick={() => send(value)}>Send</button>
      </div>
    </div>
  );
}
