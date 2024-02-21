import BigNumber from "bignumber.js";

const ten = new BigNumber(10);

export const toReal = (amount: string | BigNumber, tokenDecimal: number) => {
  return new BigNumber(amount).multipliedBy(ten.pow(tokenDecimal));
};

export const toDisplay = (amount: string | BigNumber, tokenDecimal: number) => {
  const numString = new BigNumber(amount).dividedBy(ten.pow(tokenDecimal)).toFixed();
  return insertCommas(numString);
};

export const insertCommas = (num: string) => {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 18,
  }).format(parseFloat(num));
}

