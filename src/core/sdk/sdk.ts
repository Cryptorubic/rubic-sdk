import { DefaultHttpClient } from '@rsdk-common/http/default-http-client';
import { HttpClient } from '@rsdk-common/models/http-client';
import { Web3PublicService } from '@rsdk-core/blockchain/web3-public-service/web3-public-service';
import { Injector } from '@rsdk-core/sdk/injector';
import { Configuration } from '@rsdk-core/sdk/models/configuration';
import { CrossChainManager } from '@rsdk-features/cross-chain/cross-chain-manager';
import { InstantTradesManager } from '@rsdk-features/instant-trades/instant-trades-manager';
import { CrossChainSymbiosisManager } from '@rsdk-features/cross-chain/cross-chain-symbiosis-manager';
import { CrossChainStatusManager } from 'src/features';
import { TokensManager } from 'src/common';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure';
import { Web3PrivateService } from 'src/core/blockchain/web3-private-service/web3-private-service';

/**
 * Base class to work with sdk.
 */
export class SDK {
    /**
     * Instant trades manager object. Use it to calculate and create instant trades.
     */
    public readonly instantTrades: InstantTradesManager;

    /**
     * Cross-chain trades manager object. Use it to calculate and create cross-chain trades.
     */
    public readonly crossChain: CrossChainManager;

    /**
     * Cross-chain symbiosis manager object. Use it to get pending trades in symbiosis and revert them.
     */
    public readonly crossChainSymbiosisManager: CrossChainSymbiosisManager;

    /**
     * Cross-chain status manager object. Use it to get trade statuses on source and target network.
     */
    public readonly crossChainStatusManager: CrossChainStatusManager;

    /**
     * Tokens manager object. Use it to fetch and store tokens data.
     */
    public readonly tokens = new TokensManager();

    /**
     * Can be used to get `Web3Public` instance by blockchain name to get public information from blockchain.
     */
    public get web3PublicService(): Web3PublicService {
        return Injector.web3PublicService;
    }

    /**
     * Can be used to send transactions and execute smart contracts methods.
     */
    public get web3PrivateService(): Web3PrivateService {
        return Injector.web3PrivateService;
    }

    /**
     * Use it to get gas price information.
     */
    public readonly gasPriceApi = Injector.gasPriceApi;

    /**
     * Use it to get crypto price information.
     */
    public readonly cryptoPriceApi = Injector.coingeckoApi;

    /**
     * Creates new sdk instance. Changes dependencies of all sdk entities according
     * to new configuration (even for entities created with other previous sdk instances).
     */
    public static async createSDK(configuration: Configuration): Promise<SDK> {
        const [web3PublicService, web3PrivateService, httpClient] = await Promise.all([
            SDK.createWeb3PublicService(configuration),
            SDK.createWeb3PrivateService(configuration),
            SDK.createHttpClient(configuration)
        ]);

        Injector.createInjector(web3PublicService, web3PrivateService, httpClient);
        return new SDK(configuration.providerAddress || EvmWeb3Pure.EMPTY_ADDRESS);
    }

    private static createWeb3PrivateService(configuration: Configuration): Web3PrivateService {
        return new Web3PrivateService(configuration.walletProvider);
    }

    private static createWeb3PublicService(configuration: Configuration): Web3PublicService {
        return new Web3PublicService(configuration.rpcProviders);
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
        this.crossChainSymbiosisManager = new CrossChainSymbiosisManager();
        this.crossChainStatusManager = new CrossChainStatusManager();
    }

    /**
     * Updates sdk configuration and sdk entities dependencies.
     */
    public async updateConfiguration(configuration: Configuration): Promise<void> {
        const [web3PublicService, web3PrivateService, httpClient] = await Promise.all([
            SDK.createWeb3PublicService(configuration),
            SDK.createWeb3PrivateService(configuration),
            SDK.createHttpClient(configuration)
        ]);

        Injector.createInjector(web3PublicService, web3PrivateService, httpClient);
    }
}
