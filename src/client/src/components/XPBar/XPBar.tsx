export function XPBar(props: { xp: number; lvl: number }) {
  return (
    <>
      <progress id="XPBar" max={1000} value={props.xp}></progress>
    </>
  );
}
