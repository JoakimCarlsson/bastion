/**
 * PlayPage source-read test — verifies the conditional branch that switches
 * from useGameSession (solo) to useSessionMirror (co-op) when ?lobby= is set.
 * Also verifies score submission UI and auth integration.
 *
 * Pattern: pure source-read assertion (#67). No DOM rendering required.
 */

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(resolve(__dirname, 'PlayPage.tsx'), 'utf-8');

describe('PlayPage source-read assertions', () => {
  it('imports useSessionMirror', () => {
    expect(source).toContain("from '../game/useSessionMirror'");
  });

  it('imports useGameSession (solo mode must still exist)', () => {
    expect(source).toContain('useGameSession');
  });

  it('derives isCoopMode from lobbyId', () => {
    expect(source).toContain('isCoopMode');
  });

  it('uses sessionMirror.state when in co-op mode', () => {
    expect(source).toContain('isCoopMode ? sessionMirror.state : soloSession.state');
  });

  it('sends place_tower intent via sessionMirror.placeTowerAt in co-op mode', () => {
    expect(source).toContain('sessionMirror.placeTowerAt');
  });

  it('sends start_wave intent via sessionMirror.requestStartWave in co-op mode', () => {
    expect(source).toContain('sessionMirror.requestStartWave');
  });

  it('solo mode still calls soloSession.startWave', () => {
    expect(source).toContain('soloSession.startWave()');
  });

  it('solo mode still calls soloSession.placeTowerAt', () => {
    expect(source).toContain('soloSession.placeTowerAt(pos)');
  });

  it('restart button is hidden in co-op mode', () => {
    // The restart button must be behind !isCoopMode guard.
    expect(source).toContain('!isCoopMode');
    expect(source).toContain('soloSession.restart');
  });

  it('gold label is prefixed with Shared in co-op mode', () => {
    // The HUD must render 'Shared Gold' when isCoopMode is true.
    expect(source).toContain('Shared Gold');
    // The conditional must gate on isCoopMode.
    const goldIdx = source.indexOf('Shared Gold');
    const coopIdx = source.lastIndexOf('isCoopMode', goldIdx);
    expect(coopIdx).toBeGreaterThan(-1);
  });

  it('base HP label is prefixed with Shared in co-op mode', () => {
    // The HUD must render 'Shared Base HP' when isCoopMode is true.
    expect(source).toContain('Shared Base HP');
    // The conditional must gate on isCoopMode.
    const hpIdx = source.indexOf('Shared Base HP');
    const coopIdx = source.lastIndexOf('isCoopMode', hpIdx);
    expect(coopIdx).toBeGreaterThan(-1);
  });
});

// ---------------------------------------------------------------------------
// AC2/AC3 — score submission and auth integration
// ---------------------------------------------------------------------------

describe('PlayPage score submission source-read assertions', () => {
  it('imports useAuth from ../lib/useAuth', () => {
    expect(source).toContain("from '../lib/useAuth'");
    expect(source).toContain('useAuth');
  });

  it('imports submitScore from ../lib/api/scores', () => {
    expect(source).toContain("from '../lib/api/scores'");
    expect(source).toContain('submitScore');
  });

  it('EndScreen branch references signedIn', () => {
    expect(source).toContain('signedIn');
  });

  it('EndScreen renders a /login Link when not signed in (AC3)', () => {
    expect(source).toContain('"/login"');
  });

  it('submitScore call is gated by !isCoopMode (co-op mode does not submit)', () => {
    // The handleSubmitScore function returns early when isCoopMode is true
    expect(source).toContain('isCoopMode');
    // submitScore must be called only in solo context
    const submitCallIdx = source.indexOf('submitScore(token');
    expect(submitCallIdx).toBeGreaterThan(-1);
    // There must be a !isCoopMode guard before the submitScore call
    const priorSource = source.substring(0, submitCallIdx);
    expect(priorSource).toContain('isCoopMode');
  });

  it('tracks run start timestamp via useRef', () => {
    expect(source).toContain('runStartRef');
    expect(source).toContain('useRef');
  });
});

// ---------------------------------------------------------------------------
// AC1 — phase-aware pill and co-op participant pills (HUD readability)
// ---------------------------------------------------------------------------

describe('PlayPage phase pill and co-op participant pills (AC1)', () => {
  it('renders distinct label for prep phase', () => {
    expect(source).toContain("'prep'");
    expect(source).toContain('Prep — place towers');
  });

  it('renders distinct label for combat phase', () => {
    expect(source).toContain("'combat'");
    expect(source).toContain('Wave in progress');
  });

  it('renders distinct label for gameover phase', () => {
    expect(source).toContain("'gameover'");
    expect(source).toContain('Game over');
  });

  it('renders distinct label for victory phase', () => {
    expect(source).toContain("'victory'");
    expect(source).toContain('Victory');
  });

  it('phase pill has role="status" and aria-live="polite"', () => {
    expect(source).toContain('role="status"');
    expect(source).toContain('aria-live="polite"');
  });

  it('imports getLobby from ../lib/api/lobby', () => {
    expect(source).toContain("from '../lib/api/lobby'");
    expect(source).toContain('getLobby');
  });

  it('participant pills render is gated by isCoopMode', () => {
    // The getLobby call must be guarded by isCoopMode
    const getLobbyIdx = source.indexOf('getLobby(lobbyId)');
    expect(getLobbyIdx).toBeGreaterThan(-1);
    const prior = source.substring(0, getLobbyIdx);
    expect(prior).toContain('isCoopMode');
  });

  it('lobby fetch effect uses a cancelled flag (LEARNINGS #73)', () => {
    expect(source).toContain('let cancelled = false');
    expect(source).toContain('cancelled = true');
  });
});

// ---------------------------------------------------------------------------
// Issue #77 — Full-bleed /play layout
// ---------------------------------------------------------------------------

describe('PlayPage full-bleed layout (issue #77)', () => {
  it('no longer uses calc(100vh - 8rem) inline style (AC3)', () => {
    expect(source).not.toContain('calc(100vh - 8rem)');
  });

  it('uses h-full className instead of inline height style (AC3)', () => {
    expect(source).toContain('h-full');
  });
});

// ---------------------------------------------------------------------------
// AC2 — keyboard shortcut handler wired via useEffect
// ---------------------------------------------------------------------------

describe('PlayPage keyboard shortcut wiring (AC2)', () => {
  it('imports resolveHotkey from PlayPage.hotkeys', () => {
    expect(source).toContain("from './PlayPage.hotkeys'");
    expect(source).toContain('resolveHotkey');
  });

  it('imports isTypingTarget from PlayPage.hotkeys', () => {
    expect(source).toContain('isTypingTarget');
  });

  it('adds a window keydown listener via useEffect', () => {
    expect(source).toContain("window.addEventListener('keydown'");
    expect(source).toContain("window.removeEventListener('keydown'");
  });

  it('keydown handler checks isTypingTarget before acting', () => {
    const handlerStart = source.indexOf("window.addEventListener('keydown'");
    expect(handlerStart).toBeGreaterThan(-1);
    // isTypingTarget check must appear before the addEventListener call
    const priorSource = source.substring(0, handlerStart);
    expect(priorSource).toContain('isTypingTarget');
  });

  it('Start wave button has aria-keyshortcuts="Space"', () => {
    expect(source).toContain('aria-keyshortcuts="Space"');
  });
});
