import { CoingeckoApi } from '@common/http/coingecko-api';
import { HttpClient } from '@common/models/http-client';
import { Web3Private } from '@core/blockchain/web3-private/web3-private';
import { Web3PublicService } from '@core/blockchain/web3-public/web3-public-service';

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

    public static createInjector(
        web3PublicService: Web3PublicService,
        web3Private: Web3Private,
        httpClient: HttpClient
    ): void {
        // eslint-disable-next-line no-new
        new Injector(web3PublicService, web3Private, httpClient);
    }

    private coingeckoApi: CoingeckoApi;

    private constructor(
        private readonly web3PublicService: Web3PublicService,
        private readonly web3Private: Web3Private,
        private readonly httpClient: HttpClient
    ) {
        this.coingeckoApi = new CoingeckoApi(httpClient);
        Injector.injector = this;
    }
}
