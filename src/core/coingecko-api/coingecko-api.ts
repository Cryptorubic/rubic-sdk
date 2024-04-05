import BigNumber from 'bignumber.js';
import { RubicSdkError } from 'src/common/errors';
import { BLOCKCHAIN_NAME, BlockchainName } from 'src/core/blockchain/models/blockchain-name';
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
    BLOCKCHAIN_NAME.MANTLE,
    BLOCKCHAIN_NAME.BASE,
    BLOCKCHAIN_NAME.BLAST,
    BLOCKCHAIN_NAME.KROMA,
    BLOCKCHAIN_NAME.ROOTSTOCK
] as const;

type SupportedBlockchain = (typeof supportedBlockchains)[number];

interface TokenPriceFromBackend {
    network: string;
    address: string;
    usd_price: number | null;
}

/**
 * Works with coingecko api to get tokens prices in usd.
 */
export class CoingeckoApi {
    private static isSupportedBlockchain(
        blockchain: BlockchainName
    ): blockchain is SupportedBlockchain {
        return supportedBlockchains.some(supportedBlockchain => supportedBlockchain === blockchain);
    }

    constructor(private readonly httpClient: HttpClient) {}

    private async getTokenPriceFromBackend(
        blockchain: BlockchainName,
        tokenAddress: string
    ): Promise<TokenPriceFromBackend> {
        if (!CoingeckoApi.isSupportedBlockchain(blockchain)) {
            throw new RubicSdkError(`Blockchain ${blockchain} is not supported by coingecko-api`);
        }

        try {
            return this.httpClient.get<TokenPriceFromBackend>(
                `https://dev-tokens.rubic.exchange/api/v1/tokens/price/${blockchain}/${tokenAddress}`
            );
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
        if (!CoingeckoApi.isSupportedBlockchain(token.blockchain)) {
            throw new RubicSdkError(
                `Blockchain ${token.blockchain} is not supported by coingecko-api`
            );
        }

        const response = await this.getTokenPriceFromBackend(token.blockchain, token.address);

        return new BigNumber(response?.usd_price || NaN);
    }
}
