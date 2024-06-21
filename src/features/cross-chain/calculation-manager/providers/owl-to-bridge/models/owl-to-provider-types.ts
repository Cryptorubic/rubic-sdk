import BigNumber from 'bignumber.js';

export interface OwlToTradeData {
    targetChainCode: string;
    minAmountBN: BigNumber;
    maxAmountBN: BigNumber;
    transferFee: number;
    gas: string;
    makerAddress: string;
}
