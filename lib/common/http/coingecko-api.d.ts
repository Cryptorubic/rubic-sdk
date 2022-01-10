import { HttpClient } from '../models/http-client';
import { BLOCKCHAIN_NAME } from '../../core/blockchain/models/BLOCKCHAIN_NAME';
import BigNumber from 'bignumber.js';
export declare class CoingeckoApi {
    private readonly httpClient;
    private static isSupportedBlockchain;
    private readonly nativeCoinsCoingeckoIds;
    private readonly tokenBlockchainId;
    constructor(httpClient: HttpClient);
    /**
     * Gets price of native coin in usd from coingecko.
     * @param blockchain Supported by {@link supportedBlockchains} blockchain.
     */
    getNativeCoinPrice(blockchain: BLOCKCHAIN_NAME): Promise<BigNumber>;
    /**
     * Gets price of token in usd from coingecko.
     * @param token Token to get price for.
     */
    getErc20TokenPrice(token: {
        address: string;
        blockchain: BLOCKCHAIN_NAME;
    }): Promise<BigNumber>;
    /**
     * Gets price of common token or native coin in usd from coingecko.
     * @param token Token to get price for.
     */
    getTokenPrice(token: {
        address: string;
        blockchain: BLOCKCHAIN_NAME;
    }): Promise<BigNumber>;
}
