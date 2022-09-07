import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info';
import { BlockchainName } from '@rsdk-core/blockchain/models/blockchain-name';
import { oneinchApiParams } from '@rsdk-features/instant-trades/dexes/common/oneinch-common/constants';

export function getOneinchApiBaseUrl(blockchain: BlockchainName): string {
    const blockchainId = BlockchainsInfo.getBlockchainByName(blockchain).id;
    return `${oneinchApiParams.apiBaseUrl}/${blockchainId}`;
}
