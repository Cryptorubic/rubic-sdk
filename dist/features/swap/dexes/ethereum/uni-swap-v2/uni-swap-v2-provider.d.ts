import { UniswapV2AbstractProvider } from '../../common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { UniSwapV2Trade } from './uni-swap-v2-trade';
export declare class UniSwapV2Provider extends UniswapV2AbstractProvider<UniSwapV2Trade> {
    readonly blockchain = MAINNET_BLOCKCHAIN_NAME.ETHEREUM;
    readonly InstantTradeClass: typeof UniSwapV2Trade;
    readonly providerSettings: import("../../common/uniswap-v2-abstract/models/uniswap-v2-provider-configuration").UniswapV2ProviderConfiguration;
}
