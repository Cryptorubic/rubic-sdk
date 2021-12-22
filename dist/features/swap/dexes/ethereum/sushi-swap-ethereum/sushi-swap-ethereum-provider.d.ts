import { UniswapV2AbstractProvider } from '../../common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { SushiSwapEthereumTrade } from './sushi-swap-ethereum-trade';
export declare class SushiSwapEthereumProvider extends UniswapV2AbstractProvider<SushiSwapEthereumTrade> {
    readonly blockchain = MAINNET_BLOCKCHAIN_NAME.ETHEREUM;
    readonly InstantTradeClass: typeof SushiSwapEthereumTrade;
    readonly providerSettings: import("../../common/uniswap-v2-abstract/models/uniswap-v2-provider-configuration").UniswapV2ProviderConfiguration;
}
