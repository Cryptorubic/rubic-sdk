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
     * Sender address.
     */
    sender?: string;

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
     * Celer bridge transaction ID.
     */
    celerTransactionId?: string;

    /**
     * Changenow trade id.
     */
    changenowId?: string;

    /**
     * Taiko bridge transaction ID.
     */
    taikoTransactionId?: string;

    /**
     * Squidrouter request id.
     */
    squidrouterRequestId?: string;

    /**
     * Retro bridge transaction id.
     */
    retroBridgeId?: string;

    /**
     * SimpleSwap trade id.
     */
    simpleSwapId?: string;

    /**
     * Changelly trade id.
     */
    changellySwapId?: string;

    /**
     * Takes value from 0 to 1.
     */
    slippage?: number;
}
