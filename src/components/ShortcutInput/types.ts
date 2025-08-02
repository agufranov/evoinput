import type { MODIFIER_KEYS, ValidationError } from "./util";

export type ModifierKey = (typeof MODIFIER_KEYS)[number];

export interface ShortcutData {
  modifierKeys: ModifierKey[];
  mainKey: string | null;
}

export type ValidationErrorType = {
  error: ValidationError;
};
