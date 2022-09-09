import { CoingeckoApi } from '@rsdk-common/http/coingecko-api';
import { HttpClient } from '@rsdk-common/models/http-client';
import { Web3PublicService } from '@rsdk-core/blockchain/web3-public-service/web3-public-service';
import { GasPriceApi } from '@rsdk-common/http/gas-price-api';
import { Web3PrivateService } from 'src/core/blockchain/web3-private-service/web3-private-service';

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

    private constructor(
        private readonly web3PublicService: Web3PublicService,
        private readonly web3PrivateService: Web3PrivateService,
        private readonly httpClient: HttpClient
    ) {
        this.coingeckoApi = new CoingeckoApi(httpClient);
        this.gasPriceApi = new GasPriceApi(httpClient);
        Injector.injector = this;
    }
}
