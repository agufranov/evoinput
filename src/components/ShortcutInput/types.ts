import type { DEFAULT_MODIFIER_KEYS, ValidationError } from "./util";

export type ModifierKey = (typeof DEFAULT_MODIFIER_KEYS)[number];

export interface ShortcutData {
  modifierKeys: ModifierKey[];
  mainKey: string | null;
}

export type ValidationErrorType = {
  error: ValidationError;
};
