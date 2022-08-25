import { TimeoutError } from '@rsdk-common/errors/utils/timeout.error';
import { HttpClient } from '@rsdk-common/models/http-client';
import pTimeout from '@rsdk-common/utils/p-timeout';
import { BLOCKCHAIN_NAME, BlockchainName } from '@rsdk-core/blockchain/models/blockchain-name';
import BigNumber from 'bignumber.js';
import { Cache } from 'src/common';
import { RubicSdkError } from '@rsdk-common/errors/rubic-sdk.error';
import { Web3Pure } from '@rsdk-core/blockchain/web3-pure/web3-pure';

const supportedBlockchains = [
    BLOCKCHAIN_NAME.ETHEREUM,
    BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
    BLOCKCHAIN_NAME.POLYGON,
    BLOCKCHAIN_NAME.AVALANCHE,
    BLOCKCHAIN_NAME.MOONRIVER,
    BLOCKCHAIN_NAME.FANTOM,
    BLOCKCHAIN_NAME.HARMONY,
    BLOCKCHAIN_NAME.ARBITRUM,
    BLOCKCHAIN_NAME.AURORA,
    BLOCKCHAIN_NAME.BOBA
] as const;

type SupportedBlockchain = typeof supportedBlockchains[number];

const API_BASE_URL = 'https://api.coingecko.com/api/v3/';

/**
 * Works with coingecko api to get tokens prices in usd.
 */
export class CoingeckoApi {
    private static isSupportedBlockchain(
        blockchain: BlockchainName
    ): blockchain is SupportedBlockchain {
        return supportedBlockchains.some(supportedBlockchain => supportedBlockchain === blockchain);
    }

    private readonly nativeCoinsCoingeckoIds: Record<SupportedBlockchain, string>;

    private readonly tokenBlockchainId: Record<SupportedBlockchain, string>;

    constructor(private readonly httpClient: HttpClient) {
        this.nativeCoinsCoingeckoIds = {
            [BLOCKCHAIN_NAME.ETHEREUM]: 'ethereum',
            [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: 'binancecoin',
            [BLOCKCHAIN_NAME.POLYGON]: 'matic-network',
            [BLOCKCHAIN_NAME.AVALANCHE]: 'avalanche-2',
            [BLOCKCHAIN_NAME.MOONRIVER]: 'moonriver',
            [BLOCKCHAIN_NAME.FANTOM]: 'fantom',
            [BLOCKCHAIN_NAME.HARMONY]: 'harmony',
            [BLOCKCHAIN_NAME.ARBITRUM]: 'ethereum',
            [BLOCKCHAIN_NAME.AURORA]: 'ethereum',
            [BLOCKCHAIN_NAME.BOBA]: 'ethereum'
        };

        this.tokenBlockchainId = {
            [BLOCKCHAIN_NAME.ETHEREUM]: 'ethereum',
            [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: 'binance-smart-chain',
            [BLOCKCHAIN_NAME.POLYGON]: 'polygon-pos',
            [BLOCKCHAIN_NAME.AVALANCHE]: 'avalanche',
            [BLOCKCHAIN_NAME.MOONRIVER]: 'moonriver',
            [BLOCKCHAIN_NAME.FANTOM]: 'fantom',
            [BLOCKCHAIN_NAME.HARMONY]: 'harmony-shard-0',
            [BLOCKCHAIN_NAME.ARBITRUM]: 'arbitrum-one',
            [BLOCKCHAIN_NAME.AURORA]: 'aurora',
            [BLOCKCHAIN_NAME.BOBA]: 'boba-network'
        };
    }

    /**
     * Gets price of native coin in usd from coingecko.
     * @param blockchain Supported by {@link supportedBlockchains} blockchain.
     */
    @Cache({
        maxAge: 15_000
    })
    public async getNativeCoinPrice(blockchain: BlockchainName): Promise<BigNumber> {
        if (!CoingeckoApi.isSupportedBlockchain(blockchain)) {
            throw new RubicSdkError(`Blockchain ${blockchain} is not supported by coingecko-api`);
        }

        const coingeckoId = this.nativeCoinsCoingeckoIds[blockchain];

        try {
            const response = await pTimeout(
                this.httpClient.get<{ [key: typeof coingeckoId]: { usd: string } }>(
                    `${API_BASE_URL}simple/price`,
                    {
                        params: { ids: coingeckoId, vs_currencies: 'usd' }
                    }
                ),
                3_000
            );
            const price = response?.[coingeckoId]?.usd;
            if (!price) {
                throw new RubicSdkError('Coingecko price is not defined');
            }

            return new BigNumber(price);
        } catch (err: unknown) {
            if (err instanceof TimeoutError) {
                console.debug('[RUBIC SDK]: Timeout Error. Coingecko cannot retrieve token price');
            } else if ((err as Error)?.message?.includes('Request failed with status code 429')) {
                console.debug(
                    '[RUBIC SDK]: Too many requests. Coingecko cannot retrieve token price'
                );
            } else {
                console.debug(err);
            }
            return new BigNumber(NaN);
        }
    }

    /**
     * Gets price of token in usd from coingecko.
     * @param token Token to get price for.
     */
    @Cache({
        maxAge: 15_000
    })
    public async getErc20TokenPrice(token: {
        address: string;
        blockchain: BlockchainName;
    }): Promise<BigNumber> {
        const { blockchain } = token;
        if (!CoingeckoApi.isSupportedBlockchain(blockchain)) {
            throw new RubicSdkError(`Blockchain ${blockchain} is not supported by coingecko-api`);
        }

        const blockchainId = this.tokenBlockchainId[blockchain];

        try {
            const response = await pTimeout(
                this.httpClient.get<{ market_data: { current_price: { usd: number } } }>(
                    `${API_BASE_URL}coins/${blockchainId}/contract/${token.address.toLowerCase()}`
                ),
                3_000
            );

            return new BigNumber(response?.market_data?.current_price?.usd || NaN);
        } catch (err: unknown) {
            if (err instanceof TimeoutError) {
                console.debug('[RUBIC SDK]: Timeout Error. Coingecko cannot retrieve token price');
            } else if ((err as Error)?.message?.includes('Request failed with status code 429')) {
                console.debug(
                    '[RUBIC SDK]: Too many requests. Coingecko cannot retrieve token price'
                );
            } else {
                console.debug(err);
            }
            return new BigNumber(NaN);
        }
    }

    /**
     * Gets price of common token or native coin in usd from coingecko.
     * @param token Token to get price for.
     */
    public getTokenPrice(token: {
        address: string;
        blockchain: BlockchainName;
    }): Promise<BigNumber> {
        if (Web3Pure.isNativeAddress(token.address)) {
            return this.getNativeCoinPrice(token.blockchain);
        }
        return this.getErc20TokenPrice(token);
    }
}
