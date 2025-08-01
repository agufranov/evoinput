import cn from "classnames";
import { useCallback, useState } from "react";
import style from "./ShortcutInput.module.css";

const MODIFIER_KEYS = ["Control", "Alt", "Shift", "CapsLock", "Meta"] as const;

type ModifierKeys = (typeof MODIFIER_KEYS)[number];

const getKeyDisplayName = (key: string) => {
  if (key === " ") {
    return "Space";
  }

  if (key.length === 1) {
    return key.toUpperCase();
  }

  return key;
};

export const ShortcutInput = () => {
  const [modifierKeys, setModifierKeys] = useState<string[]>([]);
  const [inProgress, setInProgress] = useState(false);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    e.preventDefault();
    if (e.repeat) return;
    console.log(e);
    setInProgress(true);
    setModifierKeys((modifierKeys) => [
      ...modifierKeys,
      getKeyDisplayName(e.key),
    ]);
  }, []);

  const handleKeyUp = useCallback((e: React.KeyboardEvent) => {
    e.preventDefault();
    setModifierKeys((modifierKeys) =>
      modifierKeys.filter((key) => key !== getKeyDisplayName(e.key))
    );
    if (modifierKeys.length === 0) {
      setInProgress(false);
    }
    setInProgress(false);
  }, []);

  return (
    <div
      className={cn(style.root, { [style.rootInProgress]: inProgress })}
      onKeyDownCapture={handleKeyDown}
      onKeyUp={handleKeyUp}
      onFocus={console.log}
      tabIndex={0}
    >
      {modifierKeys.join(" ")}
    </div>
  );
};
