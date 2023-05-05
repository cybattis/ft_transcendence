import { KeyboardEvent, useCallback, useRef, useState } from "react";
import { useSend } from "../../App";
import "./Chat.css";

export function Chat() {
  const { messages } = useSend();

  return (
    <div className="chatBox">
      <div className="chat">
        <Tabs />
        <MessageList messages={messages} />
        <InputMessage />
      </div>
      <div className="friendList">Friends list</div>
    </div>
  );
}

function Tabs() {
  const tabs = {
    display: "flex",
    flexDirection: "row" as "row",
    boxSizing: "border-box" as "border-box",
    gap: "20px",
    height: "40px",
  };

  const tab = {
    flex: "auto",
    textAlign: "center" as "center",
  };

  return (
    <div style={tabs}>
      <div style={tab}>Global</div>
      <div style={tab}>Channel</div>
      <div style={tab}>Private</div>
    </div>
  );
}

function ScrollToBottom() {
  let elem = document.querySelector(".messageList");
  let config = { childList: true };

  function callback() {
    if (elem) elem.scrollTop = elem.scrollHeight;
  }

  let observer = new MutationObserver(callback);
  if (elem) observer.observe(elem, config);
}

function MessageList({ messages }: { messages: string[] }) {
  ScrollToBottom();

  return (
    <div id={"box"} className={"messageList"}>
      {messages.map((message, index) => (
        <div key={index}>nickname: {message}</div>
      ))}
    </div>
  );
}

function InputMessage() {
  const sendButton = {
    borderRadius: "8px",
    color: "white",
    width: "100px",
    backgroundColor: "var(--cyan)",
    alignItems: "center",
    textDecoration: "none",
  };

  const inputStyle = {
    flex: "auto",

    border: "none",
    outline: 0,
    color: "var(--grey)",
    background: "var(--black)",
  };

  const sendMessage = {
    display: "flex",
    flexDirection: "row" as "row",
    boxSizing: "border-box" as "border-box",

    padding: "0 14px",
    marginTop: "10px",
    gap: "8px",

    minHeight: "40px",
    width: "100%",

    borderRadius: "12px",
    background: "var(--black)",
  };

  const { send } = useSend();
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const onInputKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        console.log("enter");
        if (value) {
          send(value);
          setValue("");
          inputRef?.current?.focus();
        }
      }
    },
    [send, value]
  );

  return (
    <div style={sendMessage}>
      <input
        onChange={(e) => {
          setValue(e.target.value);
        }}
        style={inputStyle}
        type="text"
        placeholder="Type here..."
        value={value}
        onKeyDown={onInputKeyDown}
        ref={inputRef}
      />
      <button
        style={sendButton}
        onClick={() => {
          if (value) {
            send(value);
            setValue("");
            inputRef?.current?.focus();
          }
        }}
      >
        Send
      </button>
    </div>
  );
}
