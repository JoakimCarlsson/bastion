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

// ---------------------------------------------------------------------------
// Issue #79 — HUD shell: top bar, right rail, bottom-right cluster
// ---------------------------------------------------------------------------

// Strip JSX comments ({/* … */}) for clean counting
const sourceNoJsxComments = source.replace(/\{\/\*[\s\S]*?\*\/\}/g, '');

describe('#79 HUD shell — pointer-events layout (AC4)', () => {
  it('has exactly one pointer-events-none overlay container', () => {
    // Count className usages only (not JSX comments)
    const matches = sourceNoJsxComments.match(/pointer-events-none/g) ?? [];
    expect(matches.length).toBe(1);
  });

  it('has at least three pointer-events-auto panels', () => {
    const matches = source.match(/pointer-events-auto/g) ?? [];
    expect(matches.length).toBeGreaterThanOrEqual(3);
  });

  it('GameCanvasThree is a sibling of the pointer-events-none overlay (not nested inside)', () => {
    // GameCanvasThree must appear BEFORE the pointer-events-none container in source
    const canvasIdx = source.indexOf('<GameCanvasThree');
    const overlayIdx = source.indexOf('pointer-events-none');
    expect(canvasIdx).toBeGreaterThan(-1);
    expect(overlayIdx).toBeGreaterThan(-1);
    expect(canvasIdx).toBeLessThan(overlayIdx);
  });
});

describe('#79 HUD shell — top bar region (AC1)', () => {
  it('top bar contains Wave label', () => {
    // The top-bar opening marker is the first pointer-events-auto panel
    const topBarStart = source.indexOf('HUD top bar');
    expect(topBarStart).toBeGreaterThan(-1);
    // Wave label must appear after top-bar start
    const waveIdx = source.indexOf('Wave', topBarStart);
    expect(waveIdx).toBeGreaterThan(-1);
  });

  it('top bar contains Gold (or Shared Gold) label', () => {
    const topBarStart = source.indexOf('HUD top bar');
    expect(topBarStart).toBeGreaterThan(-1);
    const goldIdx = source.indexOf('Gold', topBarStart);
    expect(goldIdx).toBeGreaterThan(-1);
  });

  it('top bar contains Base HP (or Shared Base HP) label', () => {
    const topBarStart = source.indexOf('HUD top bar');
    expect(topBarStart).toBeGreaterThan(-1);
    const hpIdx = source.indexOf('Base HP', topBarStart);
    expect(hpIdx).toBeGreaterThan(-1);
  });

  it('top bar contains PhasePill before right rail region', () => {
    const topBarStart = source.indexOf('HUD top bar');
    const rightRailStart = source.indexOf('Right rail');
    expect(topBarStart).toBeGreaterThan(-1);
    expect(rightRailStart).toBeGreaterThan(-1);
    const phasePillIdx = source.indexOf('<PhasePill', topBarStart);
    expect(phasePillIdx).toBeGreaterThan(-1);
    expect(phasePillIdx).toBeLessThan(rightRailStart);
  });

  it('top bar region appears before right-rail region in source', () => {
    const topBarIdx = source.indexOf('HUD top bar');
    const rightRailIdx = source.indexOf('Right rail');
    expect(topBarIdx).toBeGreaterThan(-1);
    expect(rightRailIdx).toBeGreaterThan(-1);
    expect(topBarIdx).toBeLessThan(rightRailIdx);
  });

  it('right-rail region appears before bottom-right cluster in source', () => {
    const rightRailIdx = source.indexOf('Right rail');
    const bottomRightIdx = source.indexOf('Bottom-right cluster');
    expect(rightRailIdx).toBeGreaterThan(-1);
    expect(bottomRightIdx).toBeGreaterThan(-1);
    expect(rightRailIdx).toBeLessThan(bottomRightIdx);
  });
});

describe('#79 HUD shell — co-op banner in top bar (AC5)', () => {
  it('isCoopMode banner block is inside top bar (before right rail)', () => {
    const topBarStart = source.indexOf('HUD top bar');
    const rightRailStart = source.indexOf('Right rail');
    expect(topBarStart).toBeGreaterThan(-1);
    expect(rightRailStart).toBeGreaterThan(-1);
    // Co-op session banner must appear between top bar and right rail markers
    const bannerIdx = source.indexOf('Co-op session:', topBarStart);
    expect(bannerIdx).toBeGreaterThan(-1);
    expect(bannerIdx).toBeLessThan(rightRailStart);
  });

  it('co-op banner is still guarded by isCoopMode &&', () => {
    const bannerIdx = source.indexOf('Co-op session:');
    expect(bannerIdx).toBeGreaterThan(-1);
    // isCoopMode must appear before the banner text
    const prior = source.substring(0, bannerIdx);
    expect(prior).toContain('isCoopMode &&');
  });
});

describe('#79 HUD shell — right rail (AC2)', () => {
  it('right rail panel has w-72 width class', () => {
    const rightRailStart = source.indexOf('Right rail');
    expect(rightRailStart).toBeGreaterThan(-1);
    // w-72 or w-[280px] must appear within 300 chars of the marker
    const region = source.substring(rightRailStart, rightRailStart + 300);
    expect(region).toMatch(/w-72|w-\[280px\]/);
  });

  it('tower-button .map iteration is inside the right-rail region', () => {
    const rightRailStart = source.indexOf('Right rail');
    const bottomRightStart = source.indexOf('Bottom-right cluster');
    expect(rightRailStart).toBeGreaterThan(-1);
    expect(bottomRightStart).toBeGreaterThan(-1);
    // towerDefs.map must appear between right rail and bottom-right cluster
    const towerMapIdx = source.indexOf('towerDefs.map', rightRailStart);
    expect(towerMapIdx).toBeGreaterThan(-1);
    expect(towerMapIdx).toBeLessThan(bottomRightStart);
  });

  it('right rail has an empty slot labelled for #88', () => {
    const rightRailStart = source.indexOf('Right rail');
    expect(rightRailStart).toBeGreaterThan(-1);
    const slotIdx = source.indexOf('#88', rightRailStart);
    expect(slotIdx).toBeGreaterThan(-1);
  });
});

describe('#79 HUD shell — bottom-right cluster (AC3)', () => {
  it('Start wave button is inside bottom-right cluster region', () => {
    const clusterStart = source.indexOf('Bottom-right cluster');
    expect(clusterStart).toBeGreaterThan(-1);
    const startWaveIdx = source.indexOf('Start wave', clusterStart);
    expect(startWaveIdx).toBeGreaterThan(-1);
  });

  it('New game button is gated by !isCoopMode inside cluster', () => {
    const clusterStart = source.indexOf('Bottom-right cluster');
    expect(clusterStart).toBeGreaterThan(-1);
    const newGameIdx = source.indexOf('New game', clusterStart);
    expect(newGameIdx).toBeGreaterThan(-1);
    // !isCoopMode guard must be between cluster start and New game text
    const between = source.substring(clusterStart, newGameIdx);
    expect(between).toContain('!isCoopMode');
  });

  it('volume slider is inside bottom-right cluster region', () => {
    const clusterStart = source.indexOf('Bottom-right cluster');
    expect(clusterStart).toBeGreaterThan(-1);
    const volumeIdx = source.indexOf('volume-slider', clusterStart);
    expect(volumeIdx).toBeGreaterThan(-1);
  });

  it('mute button is inside bottom-right cluster region', () => {
    const clusterStart = source.indexOf('Bottom-right cluster');
    expect(clusterStart).toBeGreaterThan(-1);
    // Look for muted/Sound toggle text
    const muteIdx = source.indexOf("'Muted'", clusterStart);
    expect(muteIdx).toBeGreaterThan(-1);
  });

  it('handleStartWave handler is still referenced in cluster', () => {
    const clusterStart = source.indexOf('Bottom-right cluster');
    expect(clusterStart).toBeGreaterThan(-1);
    const handlerIdx = source.indexOf('handleStartWave', clusterStart);
    expect(handlerIdx).toBeGreaterThan(-1);
  });
});
