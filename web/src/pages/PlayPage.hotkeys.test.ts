/**
 * Unit tests for PlayPage pure hotkey helpers.
 * AC2 (phase/hotkey correctness) and AC3 (lint/test pass).
 */

import { describe, expect, it } from 'vitest';
import { resolveHotkey, isTypingTarget } from './PlayPage.hotkeys';

const TOWER_IDS = ['cannon', 'archer'];

describe('resolveHotkey', () => {
  it("returns { kind: 'tower', id: 'cannon' } for key '1'", () => {
    expect(resolveHotkey('1', TOWER_IDS)).toEqual({ kind: 'tower', id: 'cannon' });
  });

  it("returns { kind: 'tower', id: 'archer' } for key '2'", () => {
    expect(resolveHotkey('2', TOWER_IDS)).toEqual({ kind: 'tower', id: 'archer' });
  });

  it("returns null for key '9' when only 2 tower ids exist", () => {
    expect(resolveHotkey('9', TOWER_IDS)).toBeNull();
  });

  it("returns null for key '0'", () => {
    expect(resolveHotkey('0', TOWER_IDS)).toBeNull();
  });

  it("returns { kind: 'start-wave' } for Space ' '", () => {
    expect(resolveHotkey(' ', TOWER_IDS)).toEqual({ kind: 'start-wave' });
  });

  it('returns null for non-digit non-space key', () => {
    expect(resolveHotkey('a', TOWER_IDS)).toBeNull();
  });

  it('returns null for Enter', () => {
    expect(resolveHotkey('Enter', TOWER_IDS)).toBeNull();
  });

  it('returns null when towerIds is empty and digit 1 pressed', () => {
    expect(resolveHotkey('1', [])).toBeNull();
  });

  it('scales to 3 towers', () => {
    const ids = ['cannon', 'archer', 'mage'];
    expect(resolveHotkey('3', ids)).toEqual({ kind: 'tower', id: 'mage' });
    expect(resolveHotkey('4', ids)).toBeNull();
  });
});

// Helper: create a minimal Element-shaped stub without a DOM (node env).
function stubEl(tag: string, contentEditable = 'inherit'): Element {
  return {
    tagName: tag.toUpperCase(),
    isContentEditable: contentEditable === 'true',
  } as unknown as Element;
}

describe('isTypingTarget', () => {
  it('returns true for <input>', () => {
    expect(isTypingTarget(stubEl('input'))).toBe(true);
  });

  it('returns true for <textarea>', () => {
    expect(isTypingTarget(stubEl('textarea'))).toBe(true);
  });

  it('returns true for <select>', () => {
    expect(isTypingTarget(stubEl('select'))).toBe(true);
  });

  it('returns false for <button>', () => {
    expect(isTypingTarget(stubEl('button'))).toBe(false);
  });

  it('returns false for <div>', () => {
    expect(isTypingTarget(stubEl('div'))).toBe(false);
  });

  it('returns false for null', () => {
    expect(isTypingTarget(null)).toBe(false);
  });

  it('returns true for contenteditable element', () => {
    expect(isTypingTarget(stubEl('div', 'true'))).toBe(true);
  });
});
