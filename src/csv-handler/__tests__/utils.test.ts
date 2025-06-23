import { describe, it, expect } from 'vitest';
import { toReal, toDisplay, insertCommas } from '../utils';

describe('utils', () => {
  it('converts display amount to real amount', () => {
    const result = toReal('1', 18);
    expect(result.toString()).toBe('1000000000000000000');
  });

  it('formats real amount to display string', () => {
    const result = toDisplay('123456', 2);
    expect(result).toBe('1,234.56');
  });

  it('inserts commas correctly', () => {
    expect(insertCommas('1234567.89')).toBe('1,234,567.89');
  });
});
