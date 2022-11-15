import { Web3PublicSupportedBlockchain } from 'src/core/blockchain/web3-public-service/models/web3-public-storage';
import { BlockchainName } from 'src/core/blockchain/models/blockchain-name';

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
     * Chainge tx serial number.
     */
    sn?: string;
}
