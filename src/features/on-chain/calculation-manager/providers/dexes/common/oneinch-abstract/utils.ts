import { BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { Injector } from 'src/core/injector/injector';

export function oneInchHttpGetRequest<T>(
    path: string,
    blockchain: BlockchainName,
    options?: {}
): Promise<T> {
    return Injector.httpClient.get(
        `https://x-api.rubic.exchange/api/swap/v6.0/${blockchainId[blockchain]}/${path}`,
        {
            ...options,
            headers: { apikey: 'sndfje3u4b3fnNSDNFUSDNVSunw345842hrnfd3b4nt4' }
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
            ...options,
            headers: { apikey: 'sndfje3u4b3fnNSDNFUSDNVSunw345842hrnfd3b4nt4' }
        }
    );
}
