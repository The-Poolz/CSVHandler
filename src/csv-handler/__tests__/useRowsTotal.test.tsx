import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import BigNumber from 'bignumber.js';
import useRowsTotal from '../useRowsTotal';
import { IRow } from '../types';

describe('useRowsTotal', () => {
  it('sums row amounts', () => {
    const rows: IRow[] = [
      { address: '0x1', amount: new BigNumber(1) },
      { address: '0x2', amount: new BigNumber(2) },
    ];

    const { result } = renderHook(() => useRowsTotal({ rows }));
    expect(result.current.toString()).toBe('3');
  });
});
