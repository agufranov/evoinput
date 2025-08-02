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

const isModifierKey = (key: string): key is ModifierKey => {
  return (MODIFIER_KEYS as readonly string[]).includes(key);
};

const modifierKeysComparator = (a: ModifierKey, b: ModifierKey) =>
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

const reverseObject = (o: object) =>
  Object.fromEntries(Object.entries(o).map(([a, b]) => [b, a]));

const SERIALIZE_KEY_DICT: Record<string, string> = {
  " ": "Space",
  "+": "Plus",
};

const PARSE_KEY_DICT = reverseObject(SERIALIZE_KEY_DICT);

const parseKey = (key: string | undefined) => {
  if (key === undefined) {
    return null;
  }

  if (key in PARSE_KEY_DICT) {
    return PARSE_KEY_DICT[key];
  }

  return key;
};

const serializeKey = (key: string) => {
  if (key in SERIALIZE_KEY_DICT) {
    return SERIALIZE_KEY_DICT[key];
  }

  return key;
};

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

const addModifierKey = (data: ShortcutData, key: ModifierKey) => {
  const { modifierKeys } = data;
  return {
    ...data,
    modifierKeys: [...new Set([...modifierKeys, key])].sort(
      modifierKeysComparator
    ),
  };
};

export const addKey = (data: ShortcutData, e: React.KeyboardEvent) => {
  if (isModifierKey(e.key)) {
    return addModifierKey(data, e.key);
  } else if (/^Key\w$/.test(e.code)) {
    return { ...data, mainKey: e.code.slice(3) };
  } else {
    return { ...data, mainKey: e.key };
  }
};
