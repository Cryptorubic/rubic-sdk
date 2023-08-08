import BigNumber from 'bignumber.js';
import { RubicSdkError, TimeoutError } from 'src/common/errors';
import { Cache } from 'src/common/utils/decorators';
import pTimeout from 'src/common/utils/p-timeout';
import { BLOCKCHAIN_NAME, BlockchainName } from 'src/core/blockchain/models/blockchain-name';
import { BlockchainsInfo } from 'src/core/blockchain/utils/blockchains-info/blockchains-info';
import { Web3Pure } from 'src/core/blockchain/web3-pure/web3-pure';
import { HttpClient } from 'src/core/http-client/models/http-client';

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
    BLOCKCHAIN_NAME.TELOS,
    BLOCKCHAIN_NAME.BOBA,
    BLOCKCHAIN_NAME.BITCOIN,
    BLOCKCHAIN_NAME.ETHEREUM_POW,
    BLOCKCHAIN_NAME.KAVA,
    BLOCKCHAIN_NAME.OASIS,
    BLOCKCHAIN_NAME.METIS,
    BLOCKCHAIN_NAME.DFK,
    BLOCKCHAIN_NAME.KLAYTN,
    BLOCKCHAIN_NAME.VELAS,
    BLOCKCHAIN_NAME.SYSCOIN,
    BLOCKCHAIN_NAME.ICP,
    BLOCKCHAIN_NAME.OPTIMISM,
    BLOCKCHAIN_NAME.CRONOS,
    BLOCKCHAIN_NAME.OKE_X_CHAIN,
    BLOCKCHAIN_NAME.GNOSIS,
    BLOCKCHAIN_NAME.FUSE,
    BLOCKCHAIN_NAME.MOONBEAM,
    BLOCKCHAIN_NAME.CELO,
    BLOCKCHAIN_NAME.BOBA_BSC,
    BLOCKCHAIN_NAME.BOBA_AVALANCHE,
    BLOCKCHAIN_NAME.BITGERT,
    BLOCKCHAIN_NAME.ETHEREUM_CLASSIC,
    BLOCKCHAIN_NAME.EOS,
    BLOCKCHAIN_NAME.FLARE,
    BLOCKCHAIN_NAME.IOTEX,
    BLOCKCHAIN_NAME.ONTOLOGY,
    BLOCKCHAIN_NAME.THETA,
    BLOCKCHAIN_NAME.XDC,
    BLOCKCHAIN_NAME.BITCOIN_CASH,
    BLOCKCHAIN_NAME.ZK_SYNC,
    BLOCKCHAIN_NAME.PULSECHAIN,
    BLOCKCHAIN_NAME.LINEA,
    BLOCKCHAIN_NAME.BASE
] as const;

type SupportedBlockchain = (typeof supportedBlockchains)[number];

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
            [BLOCKCHAIN_NAME.TELOS]: 'tlos',
            [BLOCKCHAIN_NAME.BOBA]: 'ethereum',
            [BLOCKCHAIN_NAME.BITCOIN]: 'bitcoin',
            [BLOCKCHAIN_NAME.ETHEREUM_POW]: 'ethereum-pow-iou',
            [BLOCKCHAIN_NAME.KAVA]: 'kava',
            [BLOCKCHAIN_NAME.OASIS]: 'rose',
            [BLOCKCHAIN_NAME.METIS]: 'metis',
            [BLOCKCHAIN_NAME.DFK]: 'defi-kingdoms',
            [BLOCKCHAIN_NAME.KLAYTN]: 'klaytn',
            [BLOCKCHAIN_NAME.VELAS]: 'velas',
            [BLOCKCHAIN_NAME.SYSCOIN]: 'syscoin',
            [BLOCKCHAIN_NAME.ICP]: 'internet-computer',
            [BLOCKCHAIN_NAME.OPTIMISM]: 'ethereum',
            [BLOCKCHAIN_NAME.CRONOS]: 'cronos',
            [BLOCKCHAIN_NAME.OKE_X_CHAIN]: 'okex-chain',
            [BLOCKCHAIN_NAME.GNOSIS]: 'xdai',
            [BLOCKCHAIN_NAME.FUSE]: 'fuse',
            [BLOCKCHAIN_NAME.MOONBEAM]: 'moonbeam',
            [BLOCKCHAIN_NAME.CELO]: 'celo',
            [BLOCKCHAIN_NAME.BOBA_BSC]: 'boba',
            [BLOCKCHAIN_NAME.BOBA_AVALANCHE]: 'boba',
            [BLOCKCHAIN_NAME.BITGERT]: 'bitgert',
            [BLOCKCHAIN_NAME.ETHEREUM_CLASSIC]: 'ethereum-classic',
            [BLOCKCHAIN_NAME.EOS]: 'eos',
            [BLOCKCHAIN_NAME.FLARE]: 'flare-network',
            [BLOCKCHAIN_NAME.IOTEX]: 'iotex',
            [BLOCKCHAIN_NAME.ONTOLOGY]: 'ontology',
            [BLOCKCHAIN_NAME.THETA]: 'theta',
            [BLOCKCHAIN_NAME.XDC]: 'xdc-network',
            [BLOCKCHAIN_NAME.BITCOIN_CASH]: 'bitcoin-cash',
            [BLOCKCHAIN_NAME.ZK_SYNC]: 'ethereum',
            [BLOCKCHAIN_NAME.PULSECHAIN]: 'pulsechain',
            [BLOCKCHAIN_NAME.LINEA]: 'linea',
            [BLOCKCHAIN_NAME.BASE]: 'base'
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
            [BLOCKCHAIN_NAME.TELOS]: 'telos',
            [BLOCKCHAIN_NAME.BOBA]: 'boba-network',
            [BLOCKCHAIN_NAME.BITCOIN]: 'bitcoin',
            [BLOCKCHAIN_NAME.ETHEREUM_POW]: 'ethereum-pow-iou',
            [BLOCKCHAIN_NAME.KAVA]: 'kava',
            [BLOCKCHAIN_NAME.OASIS]: 'oasis',
            [BLOCKCHAIN_NAME.METIS]: 'metis',
            [BLOCKCHAIN_NAME.DFK]: 'defi-kingdoms',
            [BLOCKCHAIN_NAME.KLAYTN]: 'klaytn',
            [BLOCKCHAIN_NAME.VELAS]: 'velas',
            [BLOCKCHAIN_NAME.SYSCOIN]: 'syscoin',
            [BLOCKCHAIN_NAME.ICP]: 'internet-computer',
            [BLOCKCHAIN_NAME.OPTIMISM]: 'optimism',
            [BLOCKCHAIN_NAME.CRONOS]: 'cronos',
            [BLOCKCHAIN_NAME.OKE_X_CHAIN]: 'okex-chain',
            [BLOCKCHAIN_NAME.GNOSIS]: 'xdai',
            [BLOCKCHAIN_NAME.FUSE]: 'fuse',
            [BLOCKCHAIN_NAME.MOONBEAM]: 'moonbeam',
            [BLOCKCHAIN_NAME.CELO]: 'celo',
            [BLOCKCHAIN_NAME.BOBA_BSC]: 'boba',
            [BLOCKCHAIN_NAME.BOBA_AVALANCHE]: 'boba',
            [BLOCKCHAIN_NAME.BITGERT]: 'bitgert',
            [BLOCKCHAIN_NAME.ETHEREUM_CLASSIC]: 'ethereum-classic',
            [BLOCKCHAIN_NAME.EOS]: 'eos',
            [BLOCKCHAIN_NAME.FLARE]: 'flare-network',
            [BLOCKCHAIN_NAME.IOTEX]: 'iotex',
            [BLOCKCHAIN_NAME.ONTOLOGY]: 'ontology',
            [BLOCKCHAIN_NAME.THETA]: 'theta',
            [BLOCKCHAIN_NAME.XDC]: 'xdc-network',
            [BLOCKCHAIN_NAME.BITCOIN_CASH]: 'bitcoin-cash',
            [BLOCKCHAIN_NAME.ZK_SYNC]: 'zksync',
            [BLOCKCHAIN_NAME.PULSECHAIN]: 'pulsechain',
            [BLOCKCHAIN_NAME.LINEA]: 'linea',
            [BLOCKCHAIN_NAME.BASE]: 'base'
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
    public async getTokenPrice(token: {
        address: string;
        blockchain: BlockchainName;
    }): Promise<BigNumber> {
        if (!CoingeckoApi.isSupportedBlockchain(token.blockchain)) {
            throw new RubicSdkError(
                `Blockchain ${token.blockchain} is not supported by coingecko-api`
            );
        }

        const chainType = BlockchainsInfo.getChainType(token.blockchain);
        if (Web3Pure[chainType].isNativeAddress(token.address)) {
            return this.getNativeCoinPrice(token.blockchain);
        }
        return this.getErc20TokenPrice(token);
    }
}
