import { CoingeckoApi } from '@rsdk-common/http/coingecko-api';
import { HttpClient } from '@rsdk-common/models/http-client';
import { Web3Private } from '@rsdk-core/blockchain/web3-private/web3-private';
import { Web3PublicService } from '@rsdk-core/blockchain/web3-public-service/web3-public-service';
import { GasPriceApi } from '@rsdk-common/http/gas-price-api';

export class Injector {
    private static injector: Injector;

    public static get web3PublicService(): Web3PublicService {
        return Injector.injector.web3PublicService;
    }

    public static get web3Private(): Web3Private {
        return Injector.injector.web3Private;
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
        web3Private: Web3Private,
        httpClient: HttpClient
    ): void {
        // eslint-disable-next-line no-new
        new Injector(web3PublicService, web3Private, httpClient);
    }

    private readonly coingeckoApi: CoingeckoApi;

    private readonly gasPriceApi: GasPriceApi;

    private constructor(
        private readonly web3PublicService: Web3PublicService,
        private readonly web3Private: Web3Private,
        private readonly httpClient: HttpClient
    ) {
        this.coingeckoApi = new CoingeckoApi(httpClient);
        this.gasPriceApi = new GasPriceApi(httpClient);
        Injector.injector = this;
    }
}
