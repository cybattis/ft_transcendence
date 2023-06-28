export function ErrorRedirection() {
  window.location.href = "http://" + process.env["REACT_APP_API_IP"] + ":3000/";
  return <></>;
}
