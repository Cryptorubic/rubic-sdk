import BigNumber from 'bignumber.js';

export const WETH_TO_ETH_ESTIMATED_GAS = new BigNumber(36_000);

export const DEFAULT_ESTIMATED_GAS = [
    new BigNumber(110_000),
    new BigNumber(210_000),
    new BigNumber(310_000)
];
