import { DefaultHttpClient } from '@common/http/default-http-client';
import { HttpClient } from '@common/models/http-client';
import { Web3Private } from '@core/blockchain/web3-private/web3-private';
import { Web3PrivateFactory } from '@core/blockchain/web3-private/web3-private-factory';
import { Web3PublicService } from '@core/blockchain/web3-public/web3-public-service';
import { Injector } from '@core/sdk/injector';
import { Configuration } from '@core/sdk/models/configuration';
import { CrossChain } from '@features/crosschain/cross-chain';
import { InstantTradesManager } from '@features/swap/instant-trades';

export class SDK {
    public readonly instantTrades: InstantTradesManager;

    public readonly crossChain: CrossChain;

    public static async createSDK(configuration: Configuration): Promise<SDK> {
        const [web3PublicService, web3Private, httpClient] = await Promise.all([
            SDK.createWeb3PublicService(configuration),
            SDK.createWeb3Private(configuration),
            SDK.createHttpClient(configuration)
        ]);

        Injector.createInjector(web3PublicService, web3Private, httpClient);
        return new SDK();
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

    private constructor() {
        this.instantTrades = new InstantTradesManager();
        this.crossChain = new CrossChain();
    }
}
