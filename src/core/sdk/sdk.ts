import { CHAIN_TYPE } from 'src/core/blockchain/models/chain-type';
import { Web3PrivateService } from 'src/core/blockchain/web3-private-service/web3-private-service';
import { Web3PublicService } from 'src/core/blockchain/web3-public-service/web3-public-service';
import { TronWeb3Pure } from 'src/core/blockchain/web3-pure/typed-web3-pure/tron-web3-pure/tron-web3-pure';
import { CoingeckoApi } from 'src/core/coingecko-api/coingecko-api';
import { GasPriceApi } from 'src/core/gas-price-api/gas-price-api';
import { DefaultHttpClient } from 'src/core/http-client/default-http-client';
import { HttpClient } from 'src/core/http-client/models/http-client';
import { Injector } from 'src/core/injector/injector';
import { Configuration } from 'src/core/sdk/models/configuration';
import { ProviderAddress } from 'src/core/sdk/models/provider-address';
import { WalletProvider, WalletProviderCore } from 'src/core/sdk/models/wallet-provider';
import { CrossChainManager } from 'src/features/cross-chain/calculation-manager/cross-chain-manager';
import { CrossChainStatusManager } from 'src/features/cross-chain/status-manager/cross-chain-status-manager';
import { CrossChainSymbiosisManager } from 'src/features/cross-chain/symbiosis-manager/cross-chain-symbiosis-manager';
import { DeflationTokenManager } from 'src/features/deflation-token-manager/deflation-token-manager';
import { OnChainManager } from 'src/features/on-chain/calculation-manager/on-chain-manager';
import { OnChainStatusManager } from 'src/features/on-chain/status-manager/on-chain-status-manager';
import { RubicApiService } from 'src/features/ws-api/rubic-api-service';

/**
 * Base class to work with sdk.
 */
export class SDK {
    /**
     * On-chain manager object. Use it to calculate and create on-chain trades.
     */
    public readonly onChainManager: OnChainManager;

    /**
     * Cross-chain trades manager object. Use it to calculate and create cross-chain trades.
     */
    public readonly crossChainManager: CrossChainManager;

    /**
     * On-chain status manager object. Use it for special providers, which requires more than one trade.
     */
    public readonly onChainStatusManager: OnChainStatusManager;

    /**
     * Cross-chain status manager object. Use it to get trade statuses on source and target network.
     */
    public readonly crossChainStatusManager: CrossChainStatusManager;

    /**
     * Cross-chain symbiosis manager object. Use it to get pending trades in symbiosis and revert them.
     */
    public readonly crossChainSymbiosisManager: CrossChainSymbiosisManager;

    /**
     * Deflation token manager object. Use it to check specific token for fees or deflation.
     */
    public readonly deflationTokenManager: DeflationTokenManager;

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
        const [web3PublicService, web3PrivateService, httpClient, apiService] = await Promise.all([
            SDK.createWeb3PublicService(configuration),
            SDK.createWeb3PrivateService(configuration),
            SDK.createHttpClient(configuration),
            SDK.createApiService(configuration)
        ]);
        Injector.createInjector(web3PublicService, web3PrivateService, httpClient, apiService);

        const { providerAddress } = configuration;
        return new SDK({
            [CHAIN_TYPE.EVM]: providerAddress?.[CHAIN_TYPE.EVM] || undefined,
            [CHAIN_TYPE.TRON]: providerAddress?.[CHAIN_TYPE.TRON] || {
                crossChain: TronWeb3Pure.EMPTY_ADDRESS,
                onChain: TronWeb3Pure.EMPTY_ADDRESS
            }
        });
    }

    private static createWeb3PrivateService(configuration: Configuration): Web3PrivateService {
        return new Web3PrivateService(configuration.walletProvider || {});
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

    private static async createApiService(configuration: Configuration): Promise<RubicApiService> {
        return new RubicApiService(configuration?.envType || 'prod');
    }

    private constructor(providerAddress: ProviderAddress) {
        this.onChainManager = new OnChainManager(providerAddress);
        this.crossChainManager = new CrossChainManager(providerAddress);
        this.deflationTokenManager = new DeflationTokenManager();
        this.onChainStatusManager = new OnChainStatusManager();
        this.crossChainStatusManager = new CrossChainStatusManager();
        this.crossChainSymbiosisManager = new CrossChainSymbiosisManager();
    }

    /**
     * Updates sdk configuration and sdk entities dependencies.
     */
    public async updateConfiguration(configuration: Configuration): Promise<void> {
        const [web3PublicService, web3PrivateService, httpClient, apiService] = await Promise.all([
            SDK.createWeb3PublicService(configuration),
            SDK.createWeb3PrivateService(configuration),
            SDK.createHttpClient(configuration),
            SDK.createApiService(configuration)
        ]);

        Injector.createInjector(web3PublicService, web3PrivateService, httpClient, apiService);
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

    public updateWalletAddress(chainType: keyof WalletProvider, address: string): void {
        Injector.web3PrivateService.updateWeb3PrivateAddress(chainType, address);
    }
}
