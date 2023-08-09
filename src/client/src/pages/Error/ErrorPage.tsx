import "./ErrorPage.css"

export function Error400Page() {
  return (
    <div className="errorPage">
      <h1>Sorry, we can't show that right now 🫣</h1>
    </div>
  );
}

export function Error404Page() {
  return (
    <div className="errorPage">
      <h1>Sorry, we didn't find what you wanted...🧐</h1>
    </div>
  );
}

export function Error500Page() {
  return (
    <div className="errorPage">
      <h1>Sorry, we are having some technical issues...🔧</h1>
    </div>
  );
}

export function ErrorInternetPage() {
  return (
    <div className="errorPage">
      <h1>Sorry, you seem to have internet issues...📡</h1>
    </div>
  );
}
