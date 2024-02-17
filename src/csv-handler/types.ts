import BigNumber from "bignumber.js";

export interface IRow {
  address: string;
  amount: string;
}

export interface ICSVHandlerProps {
  rows: IRow[];
  setRows: React.Dispatch<React.SetStateAction<IRow[]>>;
  verifyAddress?: (address: string) => boolean;
  formatters?: Formatters;
  isDeletable?: boolean;
  isEditable?: boolean;
}

export type Formatters = {
  toReal: (amount: string | BigNumber) => BigNumber;
  toDisplay: (amount: string | BigNumber, fixed?: number) => string;
};
