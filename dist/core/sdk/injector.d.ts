import { CoingeckoApi } from '../../common/http/coingecko-api';
import { HttpClient } from '../../common/models/http-client';
import { Web3Private } from '../blockchain/web3-private/web3-private';
import { Web3PublicService } from '../blockchain/web3-public/web3-public-service';
import { GasPriceApi } from '../../common/http/gas-price-api';
export declare class Injector {
    private readonly web3PublicService;
    private readonly web3Private;
    private readonly httpClient;
    private static injector;
    static get web3PublicService(): Web3PublicService;
    static get web3Private(): Web3Private;
    static get httpClient(): HttpClient;
    static get coingeckoApi(): CoingeckoApi;
    static get gasPriceApi(): GasPriceApi;
    static createInjector(web3PublicService: Web3PublicService, web3Private: Web3Private, httpClient: HttpClient): void;
    private readonly coingeckoApi;
    private readonly gasPriceApi;
    private constructor();
}
