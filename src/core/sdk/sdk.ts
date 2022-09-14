import { Configuration } from 'src/core/sdk/models/configuration';
import { Injector } from 'src/core/injector/injector';
import { HttpClient } from 'src/core/http-client/models/http-client';
import { CrossChainSymbiosisManager } from 'src/features/cross-chain/cross-chain-symbiosis-manager';
import { Web3PublicService } from 'src/core/blockchain/web3-public-service/web3-public-service';
import { Web3PrivateService } from 'src/core/blockchain/web3-private-service/web3-private-service';
import { DefaultHttpClient } from 'src/core/http-client/default-http-client';
import { EvmWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/evm-web3-pure';
import { CrossChainManager } from 'src/features/cross-chain/cross-chain-manager';
import { CrossChainStatusManager } from 'src/features/cross-chain/cross-chain-status-manager/cross-chain-status-manager';
import { InstantTradesManager } from 'src/features/instant-trades/instant-trades-manager';
import { GasPriceApi } from 'src/core/gas-price-api/gas-price-api';
import { CoingeckoApi } from 'src/core/coingecko-api/coingecko-api';
import { WalletProvider, WalletProviderCore } from 'src/core/sdk/models/wallet-provider';

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
    public get gasPriceApi(): GasPriceApi {
        return Injector.gasPriceApi;
    }

    /**
     * Use it to get coingecko price information.
     */
    public get coingeckoApi(): CoingeckoApi {
        return Injector.coingeckoApi;
    }

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

    public updateWalletProvider(walletProvider: WalletProvider): void {
        Injector.web3PrivateService.updateWeb3PrivateStorage(walletProvider);
    }

    public updateWalletProviderCore(
        chainType: keyof WalletProvider,
        walletProviderCore: WalletProviderCore
    ): void {
        Injector.web3PrivateService.updateWeb3Private(chainType, walletProviderCore);
    }
}
