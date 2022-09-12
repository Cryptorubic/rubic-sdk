import { BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { zrxApiParams } from 'src/features/instant-trades/dexes/common/zrx-common/constants';
import { RubicSdkError } from 'src/common/errors';

export function getZrxApiBaseUrl(blockchain: BlockchainName): string {
    const { apiBaseUrl } = zrxApiParams;
    if (!Object.keys(apiBaseUrl).includes(blockchain)) {
        throw new RubicSdkError(`Zrx doesn't support ${blockchain} blockchain`);
    }
    return apiBaseUrl[blockchain as keyof typeof apiBaseUrl];
}
