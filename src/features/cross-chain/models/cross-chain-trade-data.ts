import { BlockchainName } from 'src/core';

/**
 * Data required to obtain status of cross-chain trade.
 */
export interface CrossChainTradeData {
    /**
     * Source blockchain.
     */
    fromBlockchain: BlockchainName;

    /**
     * Destination blockchain.
     */
    toBlockchain: BlockchainName;

    /**
     * Trade timestamp.
     */
    txTimestamp: number;

    /**
     * Source transaction hash.
     */
    srcTxHash: string;

    /**
     * Li-fi bridge type.
     */
    lifiBridgeType?: string;

    /**
     * Via action uuid.
     */
    viaUuid?: string;
}
