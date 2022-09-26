import BigNumber from 'bignumber.js';

export const WETH_TO_ETH_ESTIMATED_GAS = new BigNumber(50_000);

export const DEFAULT_ESTIMATED_GAS = [
    new BigNumber(320_000),
    new BigNumber(420_000),
    new BigNumber(520_000)
];
