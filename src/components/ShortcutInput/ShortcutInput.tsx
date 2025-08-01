import cn from "classnames";
import { useCallback, useEffect, useMemo, useState } from "react";
import style from "./ShortcutInput.module.css";

const MODIFIER_KEYS = ["Control", "Alt", "Shift", "CapsLock", "Meta"] as const;

type ModifierKey = (typeof MODIFIER_KEYS)[number];

interface ShortcutData {
  modifierKeys: ModifierKey[];
  mainKey: string | null;
}

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

const parseValue = (value?: string): ShortcutData => {
  if (!value) {
    return { modifierKeys: [], mainKey: null };
  }
  const keys = value.split("+");
  return {
    modifierKeys: keys.filter(isModifierKey),
    mainKey: keys.find((key) => !isModifierKey(key)) || null,
  };
};

const serializeValue = (data: ShortcutData | undefined) =>
  data ? [...data.modifierKeys, data.mainKey?.toUpperCase()].join("+") : "";

const getKeysAsArray = ({ mainKey, modifierKeys }: ShortcutData) =>
  mainKey !== null ? [...modifierKeys, mainKey] : modifierKeys;

interface Props {
  value?: string;
  onChange?: (value: string | undefined) => void;
}

export const ShortcutInput = ({ value, onChange }: Props) => {
  const parsedValue = useMemo(() => parseValue(value), [value]);

  const [modifierKeys, setModifierKeys] = useState<ModifierKey[]>(
    parsedValue.modifierKeys
  );

  const [mainKey, setMainKey] = useState<string | null>(parsedValue.mainKey);

  const isValid = useMemo(
    () => mainKey !== null && modifierKeys.length > 0,
    [mainKey, modifierKeys]
  );

  const [internalValue, setInternalValue] = useState<ShortcutData | undefined>(
    isValid ? { modifierKeys, mainKey } : undefined
  );

  const [isFocused, setIsFocused] = useState(false);

  const [keysPressed, setKeysPressed] = useState(0);

  const inProgress = useMemo(() => keysPressed > 0, [keysPressed]);

  const currentKeys = useMemo(
    () => getKeysAsArray(internalValue ?? { modifierKeys, mainKey }),
    [internalValue, modifierKeys, mainKey]
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
  }, []);

  useEffect(() => {
    if (keysPressed === 0) {
      if (!isValid) {
        clear();
      } else {
        console.log("change", modifierKeys, mainKey);
        setInternalValue({ modifierKeys, mainKey });
      }
    }
  }, [keysPressed]);

  useEffect(() => {
    onChange?.(serializeValue(internalValue));
  }, [internalValue]);

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
