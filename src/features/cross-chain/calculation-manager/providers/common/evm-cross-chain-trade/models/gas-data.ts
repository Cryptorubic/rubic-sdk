import BigNumber from 'bignumber.js';

export type GasData = {
    /**
     * gasLimit * gasPrice, used if provider's api returns total gas value
     */
    readonly totalGas?: BigNumber;
    /* in wei */
    readonly gasLimit?: BigNumber;
    /* in wei */
    readonly gasPrice?: BigNumber;
    /* in wei */
    readonly baseFee?: BigNumber;
    /* in wei */
    readonly maxFeePerGas?: BigNumber;
    /* in wei */
    readonly maxPriorityFeePerGas?: BigNumber;
} | null;
