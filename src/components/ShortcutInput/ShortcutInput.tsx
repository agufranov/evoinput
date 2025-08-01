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

const getKeysAsArray = ({ mainKey, modifierKeys }: ShortcutData) =>
  mainKey !== null ? [...modifierKeys, mainKey] : modifierKeys;

const parseKey = (key: string) => (key === "Space" ? " " : key);
const serializeKey = (key: string) => (key === " " ? "Space" : key);

const parseValue = (value?: string): ShortcutData => {
  if (!value) {
    return { modifierKeys: [], mainKey: null };
  }
  const keys = value.split("+").map(parseKey);
  return {
    modifierKeys: keys.filter(isModifierKey),
    mainKey: keys.find((key) => !isModifierKey(key)) || null,
  };
};

const serializeValue = (data: ShortcutData | undefined) => {
  if (!data) return "";

  return getKeysAsArray(data).map(serializeKey).join("+");
};

interface Props {
  value?: string;
  onChange?: (value: string | undefined) => void;
  placeholder?: string;
}

export const ShortcutInput = ({ value, onChange, placeholder }: Props) => {
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

  // > Two internal states: focused and blurred
  // But one of them is redundant, so we use only 'focused'
  const [focused, setFocused] = useState(false);

  const [keysPressed, setKeysPressed] = useState(0);

  const inProgress = useMemo(() => keysPressed > 0, [keysPressed]);

  // If input is empty, show current user input, otherwise - show last saved value
  const displayKeys = useMemo(
    () => getKeysAsArray(internalValue ?? { modifierKeys, mainKey }),
    [internalValue, modifierKeys, mainKey]
  );

  const clear = () => {
    setModifierKeys([]);
    setMainKey(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
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
  };

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
  }, [onChange, internalValue]);

  const handleBlur = () => {
    setFocused(false);
    setKeysPressed(0);
  };

  return (
    <div
      className={cn(style.root, {
        [style.rootFocused]: focused,
        [style.rootInProgress]: inProgress,
      })}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onFocus={() => setFocused(true)}
      onBlur={handleBlur}
      tabIndex={0}
    >
      {displayKeys.length ? (
        displayKeys.map(getKeyDisplayName).map((key) => (
          <div className={style.key} key={key}>
            {key}
          </div>
        ))
      ) : (
        <div className={style.placeholder}>
          {placeholder ?? "Press Shortcut"}
        </div>
      )}
    </div>
  );
};
