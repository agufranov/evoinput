import cn from "classnames";
import { useCallback, useEffect, useMemo, useState } from "react";
import style from "./ShortcutInput.module.css";

const MODIFIER_KEYS = ["Control", "Alt", "Shift", "CapsLock", "Meta"] as const;

type ModifierKey = (typeof MODIFIER_KEYS)[number];

type ParsedValue = { modifierKeys: ModifierKey[]; mainKey: string | null };

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

const parseValue = (value?: string): ParsedValue => {
  if (!value) {
    return { modifierKeys: [], mainKey: null };
  }
  const keys = value.split("+");
  return {
    modifierKeys: keys.filter(isModifierKey),
    mainKey: keys.find((key) => !isModifierKey(key)) || null,
  };
};

const serializeValue = (modifierKeys: ModifierKey[], mainKey: string | null) =>
  [...modifierKeys, mainKey?.toUpperCase()].join("+");

interface Props {
  value?: string;
  onChange?: (value: string) => void;
}

export const ShortcutInput = ({ value, onChange }: Props) => {
  const parsedValue = useMemo(() => parseValue(value), [value]);

  const [modifierKeys, setModifierKeys] = useState<ModifierKey[]>(
    parsedValue.modifierKeys
  );

  const [mainKey, setMainKey] = useState<string | null>(parsedValue.mainKey);

  const [isFocused, setIsFocused] = useState(false);

  const [keysPressed, setKeysPressed] = useState(0);

  const inProgress = useMemo(() => keysPressed > 0, [keysPressed]);

  const isValid = useMemo(
    () => mainKey !== null && modifierKeys.length > 0,
    [mainKey, modifierKeys]
  );

  const currentKeys = useMemo(
    () => (mainKey !== null ? [...modifierKeys, mainKey] : modifierKeys),
    [modifierKeys, mainKey]
  );

  const keys = useMemo(() => {
    return value ? value.split("+") : [];
  }, [value]);

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
    if (keysPressed === 0) {
      if (!isValid) {
        clear();
      } else {
        onChange?.(serializeValue(modifierKeys, mainKey));
      }
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
      {currentKeys.map(getKeyDisplayName).map((key) => (
        <div className={style.key} key={key}>
          {key}
        </div>
      ))}
    </div>
  );
};
