export default function Error404() {
  const style = {
    display: "flex",
    flex: "auto",
    flexDirection: "column" as "column",
    alignItems: "center",
  };

  const text = {
    display: "flex",
    flexDirection: "column" as "column",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "200px",
  };

  return (
    <div style={style}>
      <div style={text}>
        <h1>404</h1>
        <p>Page not found</p>
        <p>Something went wrong, so this page is broken.</p>
      </div>
    </div>
  );
}
