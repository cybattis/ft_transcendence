import React, {useContext} from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import {createBrowserRouter, Navigate, RouterProvider} from "react-router-dom";
import Error404 from "./pages/Error404";
import Home from "./pages/Home/Home";
import Confirmation from "./pages/Confirmation/Confirm";
import RedirectionPage from "./pages/Redirection/Redirection";
import TFARedirection from "./pages/Confirmation/TFARedirection";
import { startPongManager } from "./game/PongManager";
import { Profile } from "./pages/Profile/Profile";
import { Game } from "./pages/Game/Game";
import { Leaderboard } from "./pages/Leaderboard/Leaderboard";
import Notifications from "./pages/Notifications/Notifications";
import { Settings } from "./pages/Settings/Settings";
import { apiBaseURL } from "./utils/constant";
import About from "./pages/About/About";
import {AuthedRoute} from "./components/Auth/AuthedRoute";

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
            path: "about",
            element: <About />,
          },
          {
            path: "profile/:username",
            element: <Profile />,
            errorElement: <Error404 />,
            loader: async ({ request, params }) => {
              const res = await fetch(
                apiBaseURL + `user/profile/${params.username}`,
                {
                  headers: {
                    Authorization:
                      "Bearer " + localStorage.getItem("token") || "",
                  },
                }
              );
              if (res.status === 400)
                throw new Response("User not found", { status: 400 });
              else if (res.status === 403) {
                localStorage.clear();
              }
              return res.json();
            },
          },
          {
            path: "notifications",
            element: <AuthedRoute component={<Notifications/>} />,
          },
          {
            path: "leaderboard",
            element: <Leaderboard />,
            loader: async ({ request, params }) => {
              const res = await fetch(apiBaseURL + "user/leaderboard", {
                headers: {
                  Authorization:
                    "Bearer " + localStorage.getItem("token") || "",
                },
              });
              if (res.status === 403) {
                localStorage.clear();
                localStorage.clear();
              }
              return res.json();
            },
          },
          {
            path: "settings",
            element: <AuthedRoute component={<Settings/>} />,
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
            element: <TFARedirection />,
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
