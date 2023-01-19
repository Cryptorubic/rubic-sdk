import { BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { Web3PublicSupportedBlockchain } from 'src/core/blockchain/web3-public-service/models/web3-public-storage';

/**
 * Data required to obtain status of cross-chain trade.
 */
export interface CrossChainTradeData {
    /**
     * Source blockchain.
     */
    fromBlockchain: Web3PublicSupportedBlockchain;

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
     * Rango request id.
     */
    rangoRequestId?: string;

    /**
     * Expected minimum output amount.
     */
    amountOutMin?: string;

    /**
     * Celer bridge transaction ID.
     */
    celerTransactionId?: string;

    /**
     * Version of symbiosis sdk, used to make swap.
     */
    symbiosisVersion?: 'v1' | 'v2';

    /**
     * Changenow trade id.
     */
    changenowId?: string;
}
