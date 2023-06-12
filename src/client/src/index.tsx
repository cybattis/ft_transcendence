import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Error404 from "./pages/Error404";
import Team from "./pages/About/Team";
import Home from "./pages/Home/Home";
import Confirmation from "./pages/Confirmation/Confirm";
import RedirectionPage from "./pages/Redirection/Redirection";
import CodeConfirmation from "./pages/Confirmation/CodeConfirm";
import { startPongManager } from "./game/PongManager";
import { Profile } from "./pages/Profile/Profile";
import { Game } from "./pages/Game/Game";
import { Leaderboard } from "./pages/Leaderboard/Leaderboard";

const router = createBrowserRouter([
  {
    path: "/",
    children: [
      {
        element: <App />,
        children: [
          {
            path: "*",
            element: <Error404 />,
          },
          {
            path: "",
            element: <Home />,
          },
          {
            path: "team",
            element: <Team />,
          },
          {
            path: "profile/:id",
            element: <Profile />,
            loader: async ({ request, params }) => {
              return fetch(`http://localhost:5400/user/profile/${params.id}`, {
                signal: request.signal,
              });
            },
          },
          {
            path: "leaderboard",
            element: <Leaderboard />,
            loader: async () => {
              return fetch(`http://localhost:5400/user/leaderboard`);
            },
          },
          {
            path: "game",
            element: <Game />,
          },
          {
            path: "loading",
            element: <RedirectionPage />,
          },
          {
            path: "confirmation",
            element: <Confirmation />,
          },
          {
            path: "code",
            element: <CodeConfirmation />,
          },
        ],
      },
    ],
  },
]);

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

startPongManager();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
//reportWebVitals(console.log);
