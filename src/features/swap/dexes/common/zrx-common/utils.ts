import { BLOCKCHAIN_NAME } from '@core/blockchain/models/BLOCKCHAIN_NAME';
import { zrxApiParams } from '@features/swap/dexes/common/zrx-common/constants';
import { RubicSdkError } from '@common/errors/rubic-sdk.error';

export function getZrxApiBaseUrl(blockchain: BLOCKCHAIN_NAME): string {
    const { apiBaseUrl } = zrxApiParams;
    if (!Object.keys(apiBaseUrl).includes(blockchain)) {
        throw new RubicSdkError(`Zrx doesn't support ${blockchain} blockchain`);
    }
    return apiBaseUrl[blockchain as keyof typeof apiBaseUrl];
}
