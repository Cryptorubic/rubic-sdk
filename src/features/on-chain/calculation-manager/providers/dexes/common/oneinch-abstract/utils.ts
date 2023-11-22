import { BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { Injector } from 'src/core/injector/injector';

export function oneInchHttpGetRequest<T>(
    path: string,
    blockchain: BlockchainName,
    options?: {}
): Promise<T> {
    return Injector.httpClient.get(
        `https://x-api.rubic.exchange/api/swap/v5.2/${blockchainId[blockchain]}/${path}`,
        {
            ...options
        }
    );
}

export function oneInchHttpGetApproveRequest<T>(
    path: string,
    blockchain: BlockchainName,
    options?: {}
): Promise<T> {
    return Injector.httpClient.get(
        `https://x-api.rubic.exchange/api/${path}/${blockchainId[blockchain]}`,
        {
            ...options
        }
    );
}
