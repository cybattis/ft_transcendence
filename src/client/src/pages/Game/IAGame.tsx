import React, { useState } from "react";
import { PracticePong } from "../../game/components/PracticePong";
import { RgbColor, stringToRGB } from "../../utils/colors";
import { AIDifficulty } from "../../game/logic/PongAi";
import { UserData } from "../Profile/user-data";
import "./IAGame.css";

export function IAGame() {
  const [mode, setMode] = useState<AIDifficulty>("Easy");
  const [title, setTitle] = useState("");
  const [ready, setReady] = useState(false);

  const paddleColor: RgbColor = stringToRGB(UserData.getPaddleColor());
  const backgroundColor: RgbColor = stringToRGB(UserData.getBackgroundColor());

  const handleMode = async (mode: string) => {
    if (mode === "Easy") {
      setMode("Easy");
      setTitle("Easy");
    } else if (mode === "Medium") {
      setMode("Medium");
      setTitle("Medium");
    } else if (mode === "Hard") {
      setMode("Hard");
      setTitle("Hard");
    } else if (mode === "GodLike") {
      setMode("Godlike");
      setTitle("GodLike");
    }
    setReady(true);
  };

  return (
    <>
      {!ready && (
        <div className="game-page-ia">
          <div className="button-choice">
            <h1 className="ia-title">Choose IA Difficulty</h1>
            <div className="buttons-ia-menu">
              <button className="mod-button" onClick={() => handleMode("Easy")}>
                <h2 className="ia-difficulty">Easy</h2>
              </button>
              <button
                className="mod-button"
                onClick={() => handleMode("Medium")}
              >
                <h2 className="ia-difficulty">Medium</h2>
              </button>
              <button className="mod-button" onClick={() => handleMode("Hard")}>
                <h2 className="ia-difficulty">Hard</h2>
              </button>
              <button
                className="mod-button"
                onClick={() => handleMode("GodLike")}
              >
                <h2 className="ia-difficulty">GodLike</h2>
              </button>
            </div>
          </div>
        </div>
      )}
      {ready && (
        <div className="game-page-ia">
          <h1 className="game-title-ia">Training - {title}</h1>
          <div className="game-screen-ia">
            <PracticePong
              name={"IAgame"}
              width={800}
              height={400}
              aiDifficulty={mode}
              paddleColor={paddleColor}
              backgroundColor={backgroundColor}
            />
          </div>
        </div>
      )}
    </>
  );
}
