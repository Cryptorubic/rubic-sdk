import { BlockchainsInfo } from '@core/blockchain/blockchains-info';
import { oneinchApiParams } from '@features/swap/constants/oneinch/oneinch-api-params';
import { BLOCKCHAIN_NAME } from '@core/blockchain/models/BLOCKCHAIN_NAME';
import { RubicSdkError } from '@common/errors/rubic-sdk-error';
import { isOneinchSupportedBlockchain } from '@features/swap/constants/oneinch/supported-blockchains';

export function getOneinchApiBaseUrl(blockchain: BLOCKCHAIN_NAME): string {
    if (!isOneinchSupportedBlockchain(blockchain)) {
        throw new RubicSdkError(`${blockchain} is not supported by oneinch`);
    }

    const blockchainId = BlockchainsInfo.getBlockchainByName(blockchain).id;
    return `${oneinchApiParams.apiBaseUrl}/${blockchainId}`;
}
