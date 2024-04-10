import BigNumber from 'bignumber.js';
import { Cache } from 'src/common/utils/decorators';
import { BLOCKCHAIN_NAME, BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { HttpClient } from 'src/core/http-client/models/http-client';

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
        const network = Object.keys(BLOCKCHAIN_NAME).find(
            chain => BLOCKCHAIN_NAME[chain as keyof typeof BLOCKCHAIN_NAME] === blockchain
        );

        try {
            const result = await this.httpClient.get<TokenPriceFromBackend>(
                `https://tokens.rubic.exchange/api/v1/tokens/price/${network
                    ?.toLowerCase()
                    .replaceAll('_', '-')}/${tokenAddress}`
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
