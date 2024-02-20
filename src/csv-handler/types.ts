import BigNumber from "bignumber.js";

export interface IRow {
  address: string;
  amount: BigNumber;
}

export interface ICSVHandlerProps {
  rows: IRow[];
  setRows: React.Dispatch<React.SetStateAction<IRow[]>>;
  verifyAddress?: (address: string) => boolean;
  tokenDecimal?: number;
  isDeletable?: boolean;
  isEditable?: boolean;
}

export type Formatters = {
  toReal: (amount: string | BigNumber) => BigNumber;
  toDisplay: (amount: string | BigNumber, fixed?: number) => string;
};
