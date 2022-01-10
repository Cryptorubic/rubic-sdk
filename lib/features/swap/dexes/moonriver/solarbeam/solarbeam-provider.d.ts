import { UniswapV2AbstractProvider } from '../../common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { SolarbeamTrade } from './solarbeam-trade';
export declare class SolarbeamProvider extends UniswapV2AbstractProvider<SolarbeamTrade> {
    readonly blockchain = MAINNET_BLOCKCHAIN_NAME.MOONRIVER;
    readonly InstantTradeClass: typeof SolarbeamTrade;
    readonly providerSettings: import("../../common/uniswap-v2-abstract/models/uniswap-v2-provider-configuration").UniswapV2ProviderConfiguration;
}
