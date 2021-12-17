import { Web3Private } from '@core/blockchain/web3-private/web3-private';
import { Web3PublicService } from '@core/blockchain/web3-public/web3-public-service';
import { Configuration } from '@core/sdk/models/configuration';
import { CrossChainManager } from '@features/cross-chain/cross-chain-manager';
import { InstantTradesManager } from '@features/swap/instant-trades-manager';
export declare class SDK {
    readonly instantTrades: InstantTradesManager;
    readonly crossChain: CrossChainManager;
    readonly web3PublicService: Web3PublicService;
    readonly web3Private: Web3Private;
    readonly gasPriceApi: import("../../common/http/gas-price-api").GasPriceApi;
    readonly cryptoPriceApi: import("../../common/http/coingecko-api").CoingeckoApi;
    static createSDK(configuration: Configuration): Promise<SDK>;
    private static createWeb3Private;
    private static createWeb3PublicService;
    private static createHttpClient;
    private constructor();
}
