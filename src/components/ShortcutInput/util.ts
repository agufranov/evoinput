import type { ModifierKey, ShortcutData, ValidationErrorType } from "./types";

export const MODIFIER_KEYS = [
  "Control",
  "Alt",
  "Shift",
  "CapsLock",
  "Meta",
] as const satisfies React.ModifierKey[];

export const INPUT_SEPARATOR = "+";

export enum ValidationError {
  NoModifierKeys = "NO_MODIFIER_KEYS",
  NoMainKey = "NO_MAIN_KEY",
  MoreThanOneMainKey = "MORE_THAN_ONE_MAIN_KEY",
  DuplicateModifierKeys = "DUPLICATE_MODIFIER_KEYS",
}

export const ERROR_MESSAGES = {
  [ValidationError.NoModifierKeys]: "No modifier keys",
  [ValidationError.NoMainKey]: "No main key",
  [ValidationError.MoreThanOneMainKey]: "More than one main key",
  [ValidationError.DuplicateModifierKeys]: "Duplicate modifier keys",
};

export const isModifierKey = (key: string): key is ModifierKey => {
  return (MODIFIER_KEYS as readonly string[]).includes(key);
};

export const modifierKeysComparator = (a: ModifierKey, b: ModifierKey) =>
  MODIFIER_KEYS.indexOf(a) - MODIFIER_KEYS.indexOf(b);

export const getKeyDisplayName = (key: string) => {
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

export const isEmpty = (data: ShortcutData) =>
  data.mainKey === null && data.modifierKeys.length === 0;

export const isValid = (data: ShortcutData) =>
  data.mainKey !== null && data.modifierKeys.length !== 0;

export const toArray = ({ mainKey, modifierKeys }: ShortcutData) =>
  mainKey !== null ? [...modifierKeys, mainKey] : modifierKeys;

export const parseKey = (key: string | undefined) =>
  key === undefined ? null : key === "Space" ? " " : key;

export const serializeKey = (key: string) =>
  key === " " ? "Space" : key.length === 1 ? key.toUpperCase() : key;

export const parse = (value: string | null): ShortcutData => {
  if (!value) {
    return {
      modifierKeys: [],
      mainKey: null,
    };
  }
  const keys = value.trim().split(INPUT_SEPARATOR).filter(Boolean);

  const modifierKeys = keys.filter(isModifierKey);

  // Validation
  if (modifierKeys.length === 0) {
    throw {
      error: ValidationError.NoModifierKeys,
    } satisfies ValidationErrorType;
  }

  if ([...new Set(modifierKeys)].length !== modifierKeys.length) {
    throw {
      error: ValidationError.DuplicateModifierKeys,
    } satisfies ValidationErrorType;
  }

  const nonModifierKeys = keys.filter((key) => !isModifierKey(key));

  if (nonModifierKeys.length === 0) {
    throw { error: ValidationError.NoMainKey } satisfies ValidationErrorType;
  }

  if (nonModifierKeys.length > 1) {
    throw {
      error: ValidationError.MoreThanOneMainKey,
    } satisfies ValidationErrorType;
  }

  return {
    modifierKeys,
    mainKey: parseKey(keys.find((key) => !isModifierKey(key))),
  };
};

export const serialize = (data: ShortcutData | null): string | null => {
  if (!data || isEmpty(data)) return "";

  return toArray(data).map(serializeKey).join(INPUT_SEPARATOR);
};

export const addModifierKey = (data: ShortcutData, key: ModifierKey) => {
  const { modifierKeys } = data;
  return {
    ...data,
    modifierKeys: [...new Set([...modifierKeys, key])].sort(
      modifierKeysComparator
    ),
  };
};
