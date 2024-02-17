import BigNumber from "bignumber.js";

export const getTokenDecimalFormatters = (tokenDecimal: number) => {
	const tenPow = new BigNumber(10).pow(tokenDecimal);
  const toReal = (amount: string | BigNumber) => {
		return new BigNumber(amount).multipliedBy(tenPow);
	}
	const toDisplay = (amount: string | BigNumber) => {
		const numString = new BigNumber(amount).dividedBy(tenPow).toFixed();
		return new Intl.NumberFormat("en-US", {
			maximumFractionDigits: 18,
		}).format(parseFloat(numString));
	}
	return { toReal, toDisplay };
};