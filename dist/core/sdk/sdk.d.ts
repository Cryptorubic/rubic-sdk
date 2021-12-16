import { Configuration } from '@core/sdk/models/configuration';
import { CrossChainManager } from '@features/cross-chain/cross-chain-manager';
import { InstantTradesManager } from '@features/swap/instant-trades-manager';
export declare class SDK {
    readonly instantTrades: InstantTradesManager;
    readonly crossChain: CrossChainManager;
    static createSDK(configuration: Configuration): Promise<SDK>;
    private static createWeb3Private;
    private static createWeb3PublicService;
    private static createHttpClient;
    private constructor();
}
