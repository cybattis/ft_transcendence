import "./XPBar.css";

export function XPBar(props: { xp: number; lvl: number }) {
    console.log("XP: ", props.xp);
    console.log("Lvl: ", props.lvl);
  return (
    <>
      <progress id="XPBar" max={1000} value={props.xp}></progress>
    </>
  );
}
