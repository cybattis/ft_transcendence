import "./XPBar.css";

export function XPBar(props: { xp: number; lvl: number }) {
  const max = props.lvl > 1 ? (1000 * props.lvl + props.lvl * 100) - 1000 : 1000;

  return (
    <>
      <progress id="XPBar" max={max} value={props.xp}></progress>
    </>
  );
}
