import { BlockchainName } from 'src/core';
import { EvmBlockchainName } from 'src/core/blockchain/models/blockchain-name';

/**
 * Data required to obtain status of cross-chain trade.
 */
export interface CrossChainTradeData {
    /**
     * Source blockchain.
     */
    fromBlockchain: EvmBlockchainName;

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

    /**
     * Rango request id
     */
    rangoRequestId?: string;
}
