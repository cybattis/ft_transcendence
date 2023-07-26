export const apiBaseURL =
  process.env["REACT_APP_PROTOCOL"] +
  "://" +
  process.env["REACT_APP_HOST_IP"] +
  ":" +
  process.env["REACT_APP_API_PORT"] +
  "/";

export const wsBaseURL =
  "ws://" +
  process.env["REACT_APP_HOST_IP"] +
  ":" +
  process.env["REACT_APP_API_PORT"] +
  "/";

export const clientBaseURL =
  process.env["REACT_APP_PROTOCOL"] +
  "://" +
  process.env["REACT_APP_HOST_IP"] +
  ":" +
  process.env["REACT_APP_CLIENT_PORT"] +
  "/";
