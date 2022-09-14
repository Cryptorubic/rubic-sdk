import { BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { oneinchApiParams } from 'src/features/instant-trades/dexes/common/oneinch-common/constants';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';

export function getOneinchApiBaseUrl(blockchain: BlockchainName): string {
    const chainId = blockchainId[blockchain];
    return `${oneinchApiParams.apiBaseUrl}/${chainId}`;
}
