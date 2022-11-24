import { BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { oneinchApiParams } from 'src/features/on-chain/calculation-manager/providers/dexes/common/oneinch-abstract/constants';

export function getOneinchApiBaseUrl(blockchain: BlockchainName): string {
    const chainId = blockchainId[blockchain];
    return `${oneinchApiParams.apiBaseUrl}/${chainId}`;
}
