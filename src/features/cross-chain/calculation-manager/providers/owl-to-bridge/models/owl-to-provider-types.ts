import { OwlToTokenInfo } from './owl-to-api-types';

export interface OwlToTradeData {
    targetChainCode: string;
    sourceToken: OwlToTokenInfo;
    transferFee: string;
    gas: string;
    makerAddress: string;
}
