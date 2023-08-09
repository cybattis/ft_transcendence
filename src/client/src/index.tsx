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
import { ProfileLoader } from "./pages/Profile/Profile";
import { Game } from "./pages/Game/Game";
import { LeaderboardLoader } from "./pages/Leaderboard/Leaderboard";
import Notifications from "./pages/Notifications/Notifications";
import { Settings } from "./pages/Settings/Settings";
import About from "./pages/About/About";
import { AuthedRoute } from "./components/Auth/AuthedRoute";
import {Error400Page, Error404Page, Error500Page, ErrorInternetPage} from "./pages/Error/ErrorPage";

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
            path: "bad-request/:path",
            element: <Error400Page />,
          },
          {
            path: "not-found/:path",
            element: <Error404Page />,
          },
          {
            path: "server-busy/:path",
            element: <Error500Page />,
          },
          {
            path: "no-internet/:path",
            element: <ErrorInternetPage />,
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
            element: <ProfileLoader/>,
          },
          {
            path: "my-profile",
            element: <ProfileLoader myProfile={true}/>,
          },
          {
            path: "notifications",
            element: <AuthedRoute component={<Notifications/>} />,
          },
          {
            path: "leaderboard",
            element: <AuthedRoute component={<LeaderboardLoader/>} />,
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
