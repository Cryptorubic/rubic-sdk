import { BlockchainsInfo } from '@core/blockchain/blockchains-info';
import { BlockchainName } from '@core/blockchain/models/blockchain-name';
import { oneinchApiParams } from '@features/instant-trades/dexes/common/oneinch-common/constants';

export function getOneinchApiBaseUrl(blockchain: BlockchainName): string {
    const blockchainId = BlockchainsInfo.getBlockchainByName(blockchain).id;
    return `${oneinchApiParams.apiBaseUrl}/${blockchainId}`;
}
