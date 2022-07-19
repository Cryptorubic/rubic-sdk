import { BlockchainName } from 'src/core';

export interface CrossChainTradeData {
    fromBlockchain: BlockchainName;
    toBlockchain: BlockchainName;
    txTimestamp: number;
    srcTxHash?: string;
    bridgeType?: string;
}
