import { BlockchainsInfo } from '@core/blockchain/blockchains-info';
import { oneinchApiParams } from '@features/swap/constants/oneinch/oneinch-api-params';
import { BLOCKCHAIN_NAME } from '@core/blockchain/models/BLOCKCHAIN_NAME';

export function getOneinchApiBaseUrl(blockchain: BLOCKCHAIN_NAME): string {
    const blockchainId = BlockchainsInfo.getBlockchainByName(blockchain).id;
    return `${oneinchApiParams.apiBaseUrl}/${blockchainId}`;
}
