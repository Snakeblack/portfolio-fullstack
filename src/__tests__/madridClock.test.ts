import { describe, expect, it } from 'vitest';
import { madridClock } from '../utils/madridClock';

describe('madridClock', () => {
  it('da la hora de Madrid en invierno (UTC+1)', () => {
    expect(madridClock(new Date('2026-01-15T17:42:00Z'))).toEqual({ hour: 18, label: '18:42', night: false });
  });

  it('da la hora de Madrid en verano (UTC+2)', () => {
    expect(madridClock(new Date('2026-07-15T10:05:00Z')).label).toBe('12:05');
  });

  it('la noche empieza a las 22:00 y acaba a las 7:00', () => {
    expect(madridClock(new Date('2026-01-15T20:59:00Z')).night).toBe(false);
    expect(madridClock(new Date('2026-01-15T21:00:00Z')).night).toBe(true);
    expect(madridClock(new Date('2026-01-15T05:59:00Z')).night).toBe(true);
    expect(madridClock(new Date('2026-01-15T06:00:00Z')).night).toBe(false);
  });

  it('la medianoche es la hora 0, no la 24', () => {
    expect(madridClock(new Date('2026-01-15T23:10:00Z'))).toEqual({ hour: 0, label: '0:10', night: true });
  });
});
