import { BLOCKCHAIN_NAME, BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import Web3 from 'web3';

export class MesonCrossChainUtils {
    public static getSearchebleId(chain: BlockchainName): string {
        if (chain === BLOCKCHAIN_NAME.TRON) {
            return 'tron';
        }
        const chainId = blockchainId[chain];
        const hexChainId = Web3.utils.toHex(chainId);
        return hexChainId;
    }
}
