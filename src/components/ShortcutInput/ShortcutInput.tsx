import cn from "classnames";
import { useCallback, useEffect, useMemo, useState } from "react";
import style from "./ShortcutInput.module.css";

const MODIFIER_KEYS = ["Control", "Alt", "Shift", "CapsLock", "Meta"] as const;

const INPUT_SEPARATOR = "+";

type ModifierKey = (typeof MODIFIER_KEYS)[number];

interface ShortcutData {
  modifierKeys: ModifierKey[];
  mainKey: string | null;
}

enum ValidationError {
  NoModifierKeys = "NO_MODIFIER_KEYS",
  NoMainKey = "NO_MAIN_KEY",
  MoreThanOneMainKey = "MORE_THAN_ONE_MAIN_KEY",
}

const ERROR_MESSAGES = {
  [ValidationError.NoModifierKeys]: "No modifier keys",
  [ValidationError.NoMainKey]: "No main key",
  [ValidationError.MoreThanOneMainKey]: "More than one main key",
};

type ValidationErrorType = {
  error: ValidationError;
};

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

const parseValue = (value: string | null): ShortcutData => {
  if (!value) {
    return {
      modifierKeys: [],
      mainKey: null,
    };
  }
  const keys = value.trim().split(INPUT_SEPARATOR).filter(Boolean);

  const modifierKeys = keys.filter(isModifierKey);
  // TODO validate
  if (modifierKeys.length === 0) {
    console.log("no modifier keys");
    throw {
      error: ValidationError.NoModifierKeys,
    } satisfies ValidationErrorType;
  }
  const nonModifierKeys = keys.filter((key) => !isModifierKey(key));
  if (nonModifierKeys.length === 0) {
    console.log("no main key");
    throw { error: ValidationError.NoMainKey } satisfies ValidationErrorType;
  }
  if (nonModifierKeys.length > 1) {
    console.log("more than one main key");
    throw {
      error: ValidationError.MoreThanOneMainKey,
    } satisfies ValidationErrorType;
  }

  return {
    modifierKeys,
    mainKey: parseKey(keys.find((key) => !isModifierKey(key))),
  };
};

const serializeValue = (data: ShortcutData | null): string | null => {
  if (!data) return null;

  if (isEmpty(data)) return "";

  return getKeysAsArray(data).map(serializeKey).join(INPUT_SEPARATOR);
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
  value: string | null;
  onChange?: (value: string | null) => void;
  placeholder?: string;
}

export const ShortcutInput = ({
  value: valueRaw,
  onChange,
  placeholder,
}: Props) => {
  const [error, setError] = useState<ValidationError | null>(null);

  const parsedValue = useMemo(() => {
    try {
      const result = parseValue(valueRaw);
      console.log("parsed successfully???", valueRaw);
      setError(null);
      return result;
    } catch (err: any) {
      console.log("err", err);
      setError(err.error);

      return null;
    }
  }, [valueRaw]);

  const [valueInternal, setValueInternal] = useState<ShortcutData | null>(
    parsedValue
  );

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

  // If value prop changes, update internal state
  useEffect(() => {
    setValueInternal(parsedValue);
  }, [parsedValue]);

  // Clear also current input, if value is cleared
  useEffect(() => {
    console.log("value internal", valueInternal);
    if (!valueInternal || isEmpty(valueInternal)) {
      setCurrentInput({
        modifierKeys: [],
        mainKey: null,
      });
    }
  }, [valueInternal]);

  // When editing done, if current input is valid - commit it
  useEffect(() => {
    if (!editing && isValidCurrentInput) {
      setValueInternal(currentInput);
    }
  }, [editing, isValidCurrentInput, currentInput]);

  // When editing done, if current input is invalid - clear it
  useEffect(() => {
    if (!editing && !isValidCurrentInput) {
      setCurrentInput({
        modifierKeys: [],
        mainKey: null,
      });
    }
  }, [editing, isValidCurrentInput]);

  useEffect(() => {
    if (valueInternal !== null) {
      onChange?.(serializeValue(valueInternal));
    }
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
        {/* TODO change keysToDisplay */}
        {!error || keysToDisplay.length ? (
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
          <div>Error: {ERROR_MESSAGES[error]}</div>
        )}
      </div>
      <pre>current input: {JSON.stringify(currentInput)}</pre>
      <pre>value internal: {JSON.stringify(valueInternal)}</pre>
      <pre>parsed value: {JSON.stringify(parsedValue)}</pre>
      <pre>error: {JSON.stringify(error)}</pre>
    </div>
  );
};
