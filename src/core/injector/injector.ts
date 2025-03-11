import { BlockchainAdapterFactoryService } from '@cryptorubic/web3';
import { Web3PrivateService } from 'src/core/blockchain/web3-private-service/web3-private-service';
import { Web3PublicService } from 'src/core/blockchain/web3-public-service/web3-public-service';
import { CoingeckoApi } from 'src/core/coingecko-api/coingecko-api';
import { GasPriceApi } from 'src/core/gas-price-api/gas-price-api';
import { HttpClient } from 'src/core/http-client/models/http-client';
import { RubicApiService } from 'src/features/ws-api/rubic-api-service';

export class Injector {
    private static injector: Injector;

    public static get web3PublicService(): Web3PublicService {
        return Injector.injector.web3PublicService;
    }

    public static get web3PrivateService(): Web3PrivateService {
        return Injector.injector.web3PrivateService;
    }

    public static get adapterFactory(): BlockchainAdapterFactoryService {
        return Injector.injector.adapterFactory;
    }

    public static get httpClient(): HttpClient {
        return Injector.injector.httpClient;
    }

    public static get coingeckoApi(): CoingeckoApi {
        return Injector.injector.coingeckoApi;
    }

    public static get gasPriceApi(): GasPriceApi {
        return Injector.injector.gasPriceApi;
    }

    public static get rubicApiService(): RubicApiService {
        return Injector.injector.rubicApiService;
    }

    public static createInjector(
        web3PublicService: Web3PublicService,
        web3PrivateService: Web3PrivateService,
        httpClient: HttpClient,
        rubicApiService: RubicApiService,
        adapterFactory: BlockchainAdapterFactoryService
    ): void {
        // eslint-disable-next-line no-new
        new Injector(
            web3PublicService,
            web3PrivateService,
            httpClient,
            rubicApiService,
            adapterFactory
        );
    }

    private readonly coingeckoApi: CoingeckoApi;

    private readonly gasPriceApi: GasPriceApi;

    private constructor(
        private readonly web3PublicService: Web3PublicService,
        private readonly web3PrivateService: Web3PrivateService,
        private readonly httpClient: HttpClient,
        private readonly rubicApiService: RubicApiService,
        private readonly adapterFactory: BlockchainAdapterFactoryService
    ) {
        this.coingeckoApi = new CoingeckoApi(httpClient);
        this.gasPriceApi = new GasPriceApi(httpClient);
        Injector.injector = this;
    }
}
