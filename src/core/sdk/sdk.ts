import { DefaultHttpClient } from '@common/http/default-http-client';
import { HttpClient } from '@common/models/http-client';
import { Web3Private } from '@core/blockchain/web3-private/web3-private';
import { Web3PrivateFactory } from '@core/blockchain/web3-private/web3-private-factory';
import { Web3PublicService } from '@core/blockchain/web3-public/web3-public-service';
import { Injector } from '@core/sdk/injector';
import { Configuration } from '@core/sdk/models/configuration';
import { CrossChainManager } from '@features/cross-chain/cross-chain-manager';
import { InstantTradesManager } from '@features/instant-trades/instant-trades-manager';
import { TokensManager } from '@features/tokens/tokens-manager';
import { EMPTY_ADDRESS } from '@core/blockchain/constants/empty-address';

export class SDK {
    public readonly instantTrades: InstantTradesManager;

    public readonly crossChain: CrossChainManager;

    public readonly tokens = new TokensManager();

    public readonly web3PublicService = Injector.web3PublicService;

    public readonly web3Private = Injector.web3Private;

    public readonly gasPriceApi = Injector.gasPriceApi;

    public readonly cryptoPriceApi = Injector.coingeckoApi;

    public static async createSDK(configuration: Configuration): Promise<SDK> {
        const [web3PublicService, web3Private, httpClient] = await Promise.all([
            SDK.createWeb3PublicService(configuration),
            SDK.createWeb3Private(configuration),
            SDK.createHttpClient(configuration)
        ]);

        Injector.createInjector(web3PublicService, web3Private, httpClient);
        return new SDK(configuration.providerAddress || EMPTY_ADDRESS);
    }

    private static createWeb3Private(configuration: Configuration): Promise<Web3Private> {
        return Web3PrivateFactory.createWeb3Private(configuration.walletProvider);
    }

    private static createWeb3PublicService(
        configuration: Configuration
    ): Promise<Web3PublicService> {
        return Web3PublicService.createWeb3PublicService(configuration.rpcProviders);
    }

    private static async createHttpClient(configuration: Configuration): Promise<HttpClient> {
        if (!configuration.httpClient) {
            return DefaultHttpClient.getInstance();
        }

        return configuration.httpClient;
    }

    private constructor(providerAddress: string) {
        this.instantTrades = new InstantTradesManager();
        this.crossChain = new CrossChainManager(providerAddress);
    }

    public async updateConfiguration(configuration: Configuration): Promise<void> {
        const [web3PublicService, web3Private, httpClient] = await Promise.all([
            SDK.createWeb3PublicService(configuration),
            SDK.createWeb3Private(configuration),
            SDK.createHttpClient(configuration)
        ]);

        Injector.createInjector(web3PublicService, web3Private, httpClient);
    }
}
