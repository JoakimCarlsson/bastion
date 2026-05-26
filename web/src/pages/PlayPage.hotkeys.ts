/**
 * Pure keyboard-shortcut helpers for PlayPage.
 * Zero React imports — pure module (LEARNINGS #35/#46).
 */

export type HotkeyAction =
  | { kind: 'tower'; id: string }
  | { kind: 'start-wave' };

/**
 * Resolves a keydown key string to a HotkeyAction, or null if unrecognised.
 *
 * - Digit keys '1'..'N' (1-indexed) map to the corresponding towerIds entry.
 * - ' ' (Space) maps to start-wave.
 * - Any other key, or a digit outside [1, towerIds.length], returns null.
 */
export function resolveHotkey(
  key: string,
  towerIds: string[],
): HotkeyAction | null {
  if (key === ' ') return { kind: 'start-wave' };

  const digit = parseInt(key, 10);
  if (!Number.isNaN(digit) && digit >= 1 && digit <= towerIds.length) {
    return { kind: 'tower', id: towerIds[digit - 1] };
  }

  return null;
}

/**
 * Returns true when the element is an interactive text target where global
 * hotkeys should be suppressed (input, textarea, select, contenteditable).
 */
export function isTypingTarget(el: Element | null): boolean {
  if (!el) return false;
  const tag = el.tagName.toLowerCase();
  if (tag === 'input' || tag === 'textarea' || tag === 'select') return true;
  if ((el as HTMLElement).isContentEditable) return true;
  return false;
}
