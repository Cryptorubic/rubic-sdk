import BigNumber from 'bignumber.js';

export interface OwlToTradeData {
    targetChainCode: string;
    minAmountBN: BigNumber;
    maxAmountBN: BigNumber;
    transferFee: string;
    gas: string;
    makerAddress: string;
}
