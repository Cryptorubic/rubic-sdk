import { BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { Injector } from 'src/core/injector/injector';
import { oneinchApiParams } from 'src/features/on-chain/calculation-manager/providers/dexes/common/oneinch-abstract/constants';

export function getOneinchApiBaseUrl(blockchain: BlockchainName): string {
    const chainId = blockchainId[blockchain];
    return `${oneinchApiParams.apiBaseUrl}/${chainId}`;
}

export function oneInchHttpGetRequest<T>(
    path: string,
    blockchain: BlockchainName,
    options?: {}
): Promise<T> {
    return Injector.httpClient.get(`${getOneinchApiBaseUrl(blockchain)}/${path}`, {
        ...options,
        headers: { Authorization: `Bearer KA7sfFl8hqo641fxTwVjnexwxv18tgaI` }
    });
}
