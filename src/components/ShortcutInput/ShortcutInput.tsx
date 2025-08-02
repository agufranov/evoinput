import cn from "classnames";
import { useCallback, useEffect, useMemo, useState } from "react";
import style from "./ShortcutInput.module.css";
import type { ModifierKey, ShortcutData } from "./types";
import {
  DEFAULT_MODIFIER_KEYS,
  ERROR_MESSAGES,
  ValidationError,
  addKey,
  getKeyDisplayName,
  isEmpty,
  isValid,
  parse,
  serialize,
  toArray,
} from "./util";

interface Props {
  value?: string | null;
  onChange?: (value: string | null) => void;
  placeholder?: string;
  allowedModifierKeys?: ModifierKey[];
}

export const ShortcutInput = ({
  value: valueRaw,
  onChange,
  placeholder,
  allowedModifierKeys,
}: Props) => {
  const [keysPressed, setKeysPressed] = useState(0);

  const editing = useMemo(() => keysPressed > 0, [keysPressed]);

  // > Two internal states: focused and blurred
  // But one of them is redundant, so we use only 'focused'
  const [focused, setFocused] = useState(false);

  const [error, setError] = useState<ValidationError | null>(null);

  const parsedValue = useMemo(() => {
    if (!valueRaw) {
      return null;
    }

    try {
      setError(null);
      return parse(valueRaw, allowedModifierKeys ?? DEFAULT_MODIFIER_KEYS);
    } catch (err: any) {
      setError(err.error);
      return null;
    }
  }, [valueRaw]);

  // Saved value
  const [valueInternal, setValueInternal] = useState<ShortcutData | null>(
    parsedValue
  );

  // Current user input
  const [currentInput, setCurrentInput] = useState<ShortcutData>({
    modifierKeys: valueInternal?.modifierKeys ?? [],
    mainKey: valueInternal?.mainKey ?? null,
  });

  const isValidCurrentInput = useMemo(
    () => isValid(currentInput),
    [currentInput]
  );

  const keysToDisplay = useMemo(() => {
    return toArray(
      valueInternal === null || isEmpty(valueInternal)
        ? currentInput
        : valueInternal
    );
  }, [currentInput, valueInternal]);

  const clearCurrentInput = () =>
    setCurrentInput({ modifierKeys: [], mainKey: null });

  // If value prop changes, update internal state
  useEffect(() => {
    setValueInternal(parsedValue);
    if (parsedValue === null) {
      clearCurrentInput();
    }
  }, [parsedValue]);

  // If value is cleared, clear also current input
  useEffect(() => {
    if (!valueInternal || isEmpty(valueInternal)) {
      clearCurrentInput();
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
      clearCurrentInput();
    }
  }, [editing, isValidCurrentInput]);

  // Fire onChange when internal value changes
  useEffect(() => {
    if (valueInternal !== null) {
      onChange?.(serialize(valueInternal));
    }
  }, [valueInternal]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.preventDefault();

    if (e.repeat) {
      return;
    }

    // When first key pressed - clear current input
    if (keysPressed === 0) {
      clearCurrentInput();
    }

    setKeysPressed((keysPressed) => keysPressed + 1);

    setCurrentInput((currentInput) =>
      addKey(currentInput, e, allowedModifierKeys ?? DEFAULT_MODIFIER_KEYS)
    );
  };

  const handleKeyUp = useCallback((e: React.KeyboardEvent) => {
    e.preventDefault();

    setKeysPressed((keysPressed) => Math.max(0, keysPressed - 1));
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
          [style.rootEditing]: editing,
          [style.rootError]: !!error && isEmpty(currentInput),
        })}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onFocus={() => setFocused(true)}
        onBlur={handleBlur}
        tabIndex={0}
      >
        {!(error && isEmpty(currentInput)) ? (
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
    </div>
  );
};
