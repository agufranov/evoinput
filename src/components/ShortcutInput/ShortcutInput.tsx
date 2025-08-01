import style from "./ShortcutInput.module.css";

export const ShortcutInput = () => {
  return (
    <div
      className={style.root}
      onKeyDown={console.log}
      onFocus={console.log}
      tabIndex={0}
    >
      ShortcutInput
    </div>
  );
};
