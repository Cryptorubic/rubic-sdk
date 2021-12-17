import { BLOCKCHAIN_NAME } from '../../../../../core/blockchain/models/BLOCKCHAIN_NAME';
import { UniswapV2AbstractProvider } from '../../common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { SushiSwapBscTrade } from './sushi-swap-bsc-trade';
export declare class SushiSwapBscProvider extends UniswapV2AbstractProvider<SushiSwapBscTrade> {
    readonly blockchain = BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN;
    readonly InstantTradeClass: typeof SushiSwapBscTrade;
    readonly providerSettings: import("../../common/uniswap-v2-abstract/models/uniswap-v2-provider-configuration").UniswapV2ProviderConfiguration;
}
