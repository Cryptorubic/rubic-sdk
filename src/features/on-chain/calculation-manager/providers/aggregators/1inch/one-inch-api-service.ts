import { BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { blockchainId } from 'src/core/blockchain/utils/blockchains-info/constants/blockchain-id';
import { Injector } from 'src/core/injector/injector';

export class OneInchApiService {
    private static apiKey = 'sndfje3u4b3fnNSDNFUSDNVSunw345842hrnfd3b4nt4';

    public static oneInchHttpGetRequest<T>(
        path: string,
        blockchain: BlockchainName,
        options?: {}
    ): Promise<T> {
        return Injector.httpClient.get(
            `https://x-api.rubic.exchange/api/swap/v5.2/${blockchainId[blockchain]}/${path}`,
            {
                ...options,
                headers: { apikey: this.apiKey }
            }
        );
    }

    public static oneInchHttpGetApproveRequest<T>(
        path: string,
        blockchain: BlockchainName,
        options?: {}
    ): Promise<T> {
        return Injector.httpClient.get(
            `https://x-api.rubic.exchange/api/${path}/${blockchainId[blockchain]}`,
            {
                ...options,
                headers: { apikey: this.apiKey }
            }
        );
    }
}
