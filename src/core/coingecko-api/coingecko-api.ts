import BigNumber from 'bignumber.js';
import { Cache } from 'src/common/utils/decorators';
import { BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { HttpClient } from 'src/core/http-client/models/http-client';

import { TO_BACKEND_BLOCKCHAINS } from '../blockchain/models/backend-blockchains';

interface TokenPriceFromBackend {
    network: string;
    address: string;
    usd_price: number | null;
}

/**
 * Works with coingecko api to get tokens prices in usd.
 */
export class CoingeckoApi {
    constructor(private readonly httpClient: HttpClient) {}

    @Cache({
        maxAge: 1000 * 60 * 5
    })
    private async getTokenPriceFromBackend(
        blockchain: BlockchainName,
        tokenAddress: string
    ): Promise<TokenPriceFromBackend> {
        try {
            const backendBlockchain = TO_BACKEND_BLOCKCHAINS[blockchain];
            const result = await this.httpClient.get<TokenPriceFromBackend>(
                `https://api.rubic.exchange/api/v2/tokens/price/${backendBlockchain}/${tokenAddress}`
            );

            return result;
        } catch (error) {
            console.debug(error);

            return {
                network: blockchain,
                address: tokenAddress,
                usd_price: null
            };
        }
    }

    /**
     * Gets price of common token or native coin in usd from coingecko.
     * @param token Token to get price for.
     */
    public async getTokenPrice(token: {
        address: string;
        blockchain: BlockchainName;
    }): Promise<BigNumber> {
        const response = await this.getTokenPriceFromBackend(token.blockchain, token.address);

        return new BigNumber(response?.usd_price || NaN);
    }
}
