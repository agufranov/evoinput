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

const modifierKeysComparator = (a: ModifierKey, b: ModifierKey) =>
  MODIFIER_KEYS.indexOf(a) - MODIFIER_KEYS.indexOf(b);

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

const isEmpty = (data: ShortcutData) =>
  data.mainKey === null && data.modifierKeys.length === 0;

const isValid = (data: ShortcutData) =>
  data.mainKey !== null && data.modifierKeys.length !== 0;

const getKeysAsArray = ({ mainKey, modifierKeys }: ShortcutData) =>
  mainKey !== null ? [...modifierKeys, mainKey] : modifierKeys;

const parseKey = (key: string | undefined) =>
  key === undefined ? null : key === "Space" ? " " : key;

const serializeKey = (key: string) =>
  key === " " ? "Space" : key.length === 1 ? key.toUpperCase() : key;

const parseValue = (value?: string): ShortcutData | null => {
  if (!value) {
    return {
      modifierKeys: [],
      mainKey: null,
    };
  }
  const keys = value.split("+").filter(Boolean);

  // TODO validate

  return {
    modifierKeys: keys.filter(isModifierKey),
    mainKey: parseKey(keys.find((key) => !isModifierKey(key))),
  };
};

const serializeValue = (data: ShortcutData | null) => {
  if (!data) return "";

  return getKeysAsArray(data).map(serializeKey).join("+");
};

const addModifierKey = (data: ShortcutData, key: ModifierKey) => {
  const { modifierKeys } = data;
  return {
    ...data,
    modifierKeys: [...new Set([...modifierKeys, key])].sort(
      modifierKeysComparator
    ),
  };
};

interface Props {
  value?: string;
  onChange?: (value: string | undefined) => void;
  placeholder?: string;
}

export const ShortcutInput = ({
  value: valueRaw,
  onChange,
  placeholder,
}: Props) => {
  const parsedValue = useMemo(() => parseValue(valueRaw), [valueRaw]);

  const [valueInternal, setValueInternal] = useState(parsedValue);

  const [currentInput, setCurrentInput] = useState<ShortcutData>({
    modifierKeys: valueInternal?.modifierKeys ?? [],
    mainKey: valueInternal?.mainKey ?? null,
  });

  const isValidCurrentInput = useMemo(
    () => isValid(currentInput),
    [currentInput]
  );

  // > Two internal states: focused and blurred
  // But one of them is redundant, so we use only 'focused'
  const [focused, setFocused] = useState(false);

  const [keysPressed, setKeysPressed] = useState(0);

  const editing = useMemo(() => keysPressed > 0, [keysPressed]);

  const keysToDisplay = useMemo(() => {
    return getKeysAsArray(
      valueInternal === null || isEmpty(valueInternal)
        ? currentInput
        : valueInternal
    );
  }, [currentInput, valueInternal]);

  useEffect(() => {
    if (!editing && isValidCurrentInput) {
      setValueInternal(currentInput);
    }
  }, [editing, isValidCurrentInput, currentInput]);

  useEffect(() => {
    if (!editing && !isValidCurrentInput) {
      setCurrentInput({
        modifierKeys: [],
        mainKey: null,
      });
    }
  }, [editing, isValidCurrentInput]);

  useEffect(() => {
    onChange?.(serializeValue(valueInternal));
  }, [valueInternal]);

  // If input is empty, show current user input, otherwise - show last saved value

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.preventDefault();

    if (e.repeat) {
      return;
    }

    // on the first key press - clear value and start from scratch
    if (keysPressed === 0) {
      setCurrentInput({
        modifierKeys: [],
        mainKey: null,
      });
    }

    setKeysPressed((keysPressed) => keysPressed + 1);

    if (isModifierKey(e.key)) {
      setCurrentInput((currentInput) =>
        addModifierKey(currentInput, e.key as ModifierKey)
      );
    } else {
      setCurrentInput((currentInput) => ({ ...currentInput, mainKey: e.key }));
    }
  };

  const handleKeyUp = useCallback((e: React.KeyboardEvent) => {
    e.preventDefault();

    setKeysPressed((keysPressed) => keysPressed - 1);
  }, []);

  const handleBlur = () => {
    setFocused(false);
    setKeysPressed(0);
  };

  return (
    <div>
      <div
        className={cn(style.root, {
          [style.rootFocused]: focused,
          [style.rootInProgress]: editing,
        })}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onFocus={() => setFocused(true)}
        onBlur={handleBlur}
        tabIndex={0}
      >
        {true || isValidCurrentInput ? (
          keysToDisplay.length ? (
            keysToDisplay.map(getKeyDisplayName).map((key) => (
              <div className={style.key} key={key}>
                {key}
              </div>
            ))
          ) : (
            <div className={style.placeholder}>
              {placeholder ?? "Press Shortcut"}
            </div>
          )
        ) : (
          <div>Invalid</div>
        )}
      </div>
      <pre>current input: {JSON.stringify(currentInput)}</pre>
      <pre>value internal: {JSON.stringify(valueInternal)}</pre>
    </div>
  );
};
