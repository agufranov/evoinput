import cn from "classnames";
import { useCallback, useEffect, useMemo, useState } from "react";
import style from "./ShortcutInput.module.css";

const MODIFIER_KEYS = ["Control", "Alt", "Shift", "CapsLock", "Meta"] as const;

type ModifierKey = (typeof MODIFIER_KEYS)[number];

const isModifierKey = (key: string): key is ModifierKey => {
  return (MODIFIER_KEYS as readonly string[]).includes(key);
};

const getKeyDisplayName = (key: string) => {
  if (key === " ") {
    return "Space";
  }

  if (key === "Control") {
    return "Ctrl";
  }

  if (key.length === 1) {
    return key.toUpperCase();
  }

  return key;
};

export const ShortcutInput = () => {
  const [isFocused, setIsFocused] = useState(false);
  const [modifierKeys, setModifierKeys] = useState<ModifierKey[]>([]);
  const [mainKey, setMainKey] = useState<string | null>(null);
  const [keysPressed, setKeysPressed] = useState(0);

  const inProgress = useMemo(() => keysPressed > 0, [keysPressed]);
  const isValid = useMemo(
    () => mainKey !== null && modifierKeys.length > 0,
    [mainKey, modifierKeys]
  );
  const keys = useMemo(
    () => (mainKey !== null ? [...modifierKeys, mainKey] : modifierKeys),
    [modifierKeys, mainKey]
  );

  const clear = () => {
    setModifierKeys([]);
    setMainKey(null);
  };

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      e.preventDefault();

      if (e.repeat) {
        return;
      }

      if (keysPressed === 0) {
        clear();
      }

      setKeysPressed((keysPressed) => keysPressed + 1);

      if (isModifierKey(e.key)) {
        setModifierKeys((modifierKeys) =>
          [...new Set([...modifierKeys, e.key] as ModifierKey[])].sort(
            (a, b) => MODIFIER_KEYS.indexOf(a) - MODIFIER_KEYS.indexOf(b)
          )
        );
      } else {
        setMainKey(e.key);
      }
    },
    [keysPressed]
  );

  const handleKeyUp = useCallback((e: React.KeyboardEvent) => {
    e.preventDefault();

    setKeysPressed((keysPressed) => keysPressed - 1);

    // if (isModifierKey(e.key)) {
    //   setModifierKeys((modifierKeys) =>
    //     modifierKeys.filter((key) => key !== e.key)
    //   );
    // }
  }, []);

  useEffect(() => {
    if (keysPressed === 0 && !isValid) {
      clear();
    }
  }, [keysPressed]);

  const handleBlur = () => {
    setIsFocused(false);
    setKeysPressed(0);
  };

  return (
    <div
      className={cn(style.root, {
        [style.rootFocused]: isFocused,
        [style.rootInProgress]: inProgress,
      })}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onFocus={() => setIsFocused(true)}
      onBlur={handleBlur}
      tabIndex={0}
    >
      {keys.map(getKeyDisplayName).map((key) => (
        <div className={style.key} key={key}>
          {key}
        </div>
      ))}
    </div>
  );
};
