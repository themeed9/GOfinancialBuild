import { describe, expect, it } from 'vitest';

import { localDayKey, shouldReportDailyOpen } from '../core/activity';
import { avatarInitial, normalizeUsername, validateUsername } from '../core/username';
import { at } from './helpers';

describe('username', () => {
  it('normalizes what the user types', () => {
    expect(normalizeUsername('@Meed ')).toBe('meed');
    expect(normalizeUsername('A B C')).toBe('abc');
    expect(normalizeUsername('x'.repeat(30))).toHaveLength(20);
  });

  it('accepts valid usernames', () => {
    expect(validateUsername('meed')).toEqual({ ok: true, username: 'meed' });
    expect(validateUsername('@Abdul_hameed.77')).toEqual({ ok: true, username: 'abdul_hameed.77' });
  });

  it('explains what is wrong', () => {
    expect(validateUsername('')).toMatchObject({ ok: false, error: 'Choose a username to continue' });
    expect(validateUsername('ab')).toMatchObject({ ok: false, error: 'At least 3 characters' });
    expect(validateUsername('me-ed')).toMatchObject({ ok: false });
    expect(validateUsername('7meed')).toMatchObject({ ok: false, error: 'Start with a letter' });
  });

  it('shows the first letter or a question mark in the avatar', () => {
    expect(avatarInitial('')).toBe('?');
    expect(avatarInitial('meed')).toBe('M');
  });
});

describe('daily activity', () => {
  it('uses the local calendar day', () => {
    expect(localDayKey(at(2026, 11, 27, 23))).toBe('2026-11-27');
    expect(localDayKey(at(2026, 1, 5, 0))).toBe('2026-01-05');
  });

  it('reports once per day', () => {
    expect(shouldReportDailyOpen(null, at(2026, 11, 27))).toBe(true);
    expect(shouldReportDailyOpen('2026-11-27', at(2026, 11, 27, 22))).toBe(false);
    expect(shouldReportDailyOpen('2026-11-27', at(2026, 11, 28, 0))).toBe(true);
  });
});
