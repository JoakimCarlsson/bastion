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
