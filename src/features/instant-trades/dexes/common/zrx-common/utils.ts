import { BlockchainName } from '@rsdk-core/blockchain/models/blockchain-name';
import { zrxApiParams } from '@rsdk-features/instant-trades/dexes/common/zrx-common/constants';
import { RubicSdkError } from '@rsdk-common/errors/rubic-sdk.error';

export function getZrxApiBaseUrl(blockchain: BlockchainName): string {
    const { apiBaseUrl } = zrxApiParams;
    if (!Object.keys(apiBaseUrl).includes(blockchain)) {
        throw new RubicSdkError(`Zrx doesn't support ${blockchain} blockchain`);
    }
    return apiBaseUrl[blockchain as keyof typeof apiBaseUrl];
}
