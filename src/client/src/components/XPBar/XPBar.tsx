import "./XPBar.css";

export function XPBar(props: { xp: number; lvl: number }) {
  const max = props.lvl > 1 ? 1000 * props.lvl + props.lvl * 100 - 1000 : 1000;
  const value =
    props.lvl > 1
      ? props.xp - 1000 * (props.lvl - 1) - 200 * (props.lvl - 2)
      : props.xp;

  return (
    <>
      <progress id="XPBar" max={max} value={value}></progress>
    </>
  );
}
