import { TeleswapSDK } from '@teleportdao/teleswap-sdk';
import { Web3PrivateService } from 'src/core/blockchain/web3-private-service/web3-private-service';
import { Web3PublicService } from 'src/core/blockchain/web3-public-service/web3-public-service';
import { CoingeckoApi } from 'src/core/coingecko-api/coingecko-api';
import { GasPriceApi } from 'src/core/gas-price-api/gas-price-api';
import { HttpClient } from 'src/core/http-client/models/http-client';

export class Injector {
    private static injector: Injector;

    public static get web3PublicService(): Web3PublicService {
        return Injector.injector.web3PublicService;
    }

    public static get web3PrivateService(): Web3PrivateService {
        return Injector.injector.web3PrivateService;
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

    public static get teleSwapSdkInstance(): TeleswapSDK {
        return Injector.injector.teleSwapSdk;
    }

    public static createInjector(
        web3PublicService: Web3PublicService,
        web3PrivateService: Web3PrivateService,
        httpClient: HttpClient
    ): void {
        // eslint-disable-next-line no-new
        new Injector(web3PublicService, web3PrivateService, httpClient);
    }

    private readonly coingeckoApi: CoingeckoApi;

    private readonly gasPriceApi: GasPriceApi;

    private readonly teleSwapSdk: TeleswapSDK;

    private constructor(
        private readonly web3PublicService: Web3PublicService,
        private readonly web3PrivateService: Web3PrivateService,
        private readonly httpClient: HttpClient
    ) {
        this.coingeckoApi = new CoingeckoApi(httpClient);
        this.gasPriceApi = new GasPriceApi(httpClient);
        this.teleSwapSdk = new TeleswapSDK();
        Injector.injector = this;
    }
}
