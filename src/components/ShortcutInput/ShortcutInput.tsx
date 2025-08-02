import cn from "classnames";
import { useCallback, useEffect, useMemo, useState } from "react";
import style from "./ShortcutInput.module.css";
import type { ModifierKey, ShortcutData } from "./types";
import {
  ERROR_MESSAGES,
  ValidationError,
  addModifierKey,
  getKeyDisplayName,
  isEmpty,
  isModifierKey,
  isValid,
  parse,
  serialize,
  toArray,
} from "./util";

interface Props {
  value?: string | null;
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
    if (!valueRaw) {
      return null;
    }
    try {
      setError(null);
      const result = parse(valueRaw);
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
    return toArray(
      valueInternal === null || isEmpty(valueInternal)
        ? currentInput
        : valueInternal
    );
  }, [currentInput, valueInternal]);

  // If value prop changes, update internal state
  useEffect(() => {
    setValueInternal(parsedValue);
    if (parsedValue === null) {
      setCurrentInput({
        modifierKeys: [],
        mainKey: null,
      });
    }
  }, [parsedValue]);

  // Clear also current input, if value is cleared
  useEffect(() => {
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
