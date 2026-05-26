import { describe, expect, it } from 'vitest';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(resolve(__dirname, 'App.tsx'), 'utf-8');

// ---------------------------------------------------------------------------
// Source-read tests: verify App module wires /login, /register, and AuthNav
// ---------------------------------------------------------------------------

describe('App module exports', () => {
  it('exports App component', async () => {
    const mod = await import('./App');
    expect(typeof mod.App).toBe('function');
  });
});

// ---------------------------------------------------------------------------
// AC1 — /leaderboard route and nav link are present
// ---------------------------------------------------------------------------

describe('App source-read assertions', () => {
  it('nav contains /leaderboard link', () => {
    expect(source).toContain('"/leaderboard"');
  });

  it('/leaderboard route is registered', () => {
    expect(source).toContain('path="/leaderboard"');
  });

  it('imports LeaderboardPage', () => {
    expect(source).toContain('LeaderboardPage');
  });
});

// These tests verify the route and AuthNav presence as a source-read check.
// Browser smoke verification (manual AC2 / AC3) covers the live rendering.

// ---------------------------------------------------------------------------
// Issue #77 — Full-bleed /play layout
// ---------------------------------------------------------------------------

describe('App Shell — full-bleed /play layout (issue #77)', () => {
  it('imports useLocation from react-router-dom', () => {
    expect(source).toContain('useLocation');
    expect(source).toContain("from 'react-router-dom'");
  });

  it("source contains '/play' pathname check", () => {
    expect(source).toContain("'/play'");
  });

  it('source contains h-[100dvh] token for play shell', () => {
    expect(source).toContain('h-[100dvh]');
  });

  it('source still contains max-w-3xl (AC2 regression guard)', () => {
    expect(source).toContain('max-w-3xl');
  });
});

// ---------------------------------------------------------------------------
// Issue #78 — slim /play top bar
// ---------------------------------------------------------------------------

describe('issue #78 — slim /play top bar', () => {
  it('source contains PlayTopBar component definition', () => {
    expect(source).toContain('PlayTopBar');
  });

  it('source contains Back to menu link text', () => {
    expect(source).toContain('Back to menu');
  });

  it('source contains h-12 Tailwind class for slim top bar (≤56px)', () => {
    expect(source).toContain('h-12');
  });

  it('source still contains full header classes (AC3 regression guard)', () => {
    expect(source).toContain('mb-8 border-b border-slate-800 pb-4');
    expect(source).toContain('max-w-3xl');
  });

  it('PlayTopBar JSX usage appears after the isPlay branch marker in source', () => {
    const isPlayIdx = source.indexOf("isPlay = location.pathname === '/play'");
    // Look for the JSX usage <PlayTopBar rather than the function definition
    const playTopBarUsageIdx = source.indexOf('<PlayTopBar');
    expect(isPlayIdx).toBeGreaterThan(-1);
    expect(playTopBarUsageIdx).toBeGreaterThan(-1);
    expect(playTopBarUsageIdx).toBeGreaterThan(isPlayIdx);
  });
});
