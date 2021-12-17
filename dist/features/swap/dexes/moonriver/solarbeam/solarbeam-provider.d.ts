import { BLOCKCHAIN_NAME } from '@core/blockchain/models/BLOCKCHAIN_NAME';
import { UniswapV2AbstractProvider } from '@features/swap/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { SolarbeamTrade } from '@features/swap/dexes/moonriver/solarbeam/solarbeam-trade';
export declare class SolarbeamProvider extends UniswapV2AbstractProvider<SolarbeamTrade> {
    readonly blockchain = BLOCKCHAIN_NAME.MOONRIVER;
    readonly InstantTradeClass: typeof SolarbeamTrade;
    readonly providerSettings: import("../../common/uniswap-v2-abstract/models/uniswap-v2-provider-configuration").UniswapV2ProviderConfiguration;
}
