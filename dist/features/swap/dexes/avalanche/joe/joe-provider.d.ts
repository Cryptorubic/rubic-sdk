import { UniswapV2AbstractProvider } from '../../common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { JoeTrade } from './joe-trade';
export declare class JoeProvider extends UniswapV2AbstractProvider<JoeTrade> {
    readonly blockchain = MAINNET_BLOCKCHAIN_NAME.AVALANCHE;
    readonly InstantTradeClass: typeof JoeTrade;
    readonly providerSettings: import("../../common/uniswap-v2-abstract/models/uniswap-v2-provider-configuration").UniswapV2ProviderConfiguration;
}
