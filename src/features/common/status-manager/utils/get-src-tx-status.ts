import { Web3PublicSupportedBlockchain } from 'src/core/blockchain/web3-public-service/models/web3-public-storage';
import { TxStatus } from 'src/core/blockchain/web3-public-service/web3-public/models/tx-status';
import { Injector } from 'src/core/injector/injector';

/**
 * Get cross-chain trade's source transaction status via receipt.
 * @returns Cross-chain transaction status.
 */
export async function getSrcTxStatus(
    fromBlockchain: Web3PublicSupportedBlockchain,
    srcTxHash: string
): Promise<TxStatus> {
    try {
        const web3Public = Injector.web3PublicService.getWeb3Public(fromBlockchain);
        return await web3Public.getTransactionStatus(srcTxHash);
    } catch {
        return TxStatus.PENDING;
    }
}
