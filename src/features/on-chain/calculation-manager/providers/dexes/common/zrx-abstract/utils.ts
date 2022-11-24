import { RubicSdkError } from 'src/common/errors';
import { BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { zrxApiParams } from 'src/features/on-chain/calculation-manager/providers/dexes/common/zrx-abstract/constants';

export function getZrxApiBaseUrl(blockchain: BlockchainName): string {
    const { apiBaseUrl } = zrxApiParams;
    if (!Object.keys(apiBaseUrl).includes(blockchain)) {
        throw new RubicSdkError(`Zrx doesn't support ${blockchain} blockchain`);
    }
    return apiBaseUrl[blockchain as keyof typeof apiBaseUrl];
}
