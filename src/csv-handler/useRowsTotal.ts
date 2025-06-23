import { useMemo } from 'react'
import { IRow } from './types'
import BigNumber from "bignumber.js";

const useRowsTotal = ({rows}: {rows: IRow[]}) => {
  const totalAmount: BigNumber = useMemo(() => {
    return rows.reduce((acc: BigNumber, row: IRow) => {
      return acc.plus(row.amount)
    }, new BigNumber(0))
  }, [rows])
  return totalAmount 
}

export default useRowsTotal
