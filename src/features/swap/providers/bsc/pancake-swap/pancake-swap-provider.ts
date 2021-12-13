import { BLOCKCHAIN_NAME } from '@core/blockchain/models/BLOCKCHAIN_NAME';
import { PANCAKE_SWAP_PROVIDER_CONFIGURATION } from '@features/swap/providers/bsc/pancake-swap/constants';
import { UniswapV2AbstractProvider } from '@features/swap/providers/common/uniswap-v2-abstract-provider/uniswap-v2-abstract-provider';
import { PancakeSwapTrade } from '@features/swap/trades/bsc/pancake-swap/pancake-swap-trade';

export class PancakeSwapProvider extends UniswapV2AbstractProvider<PancakeSwapTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN;

    public readonly InstantTradeClass = PancakeSwapTrade;

    public readonly providerSettings = PANCAKE_SWAP_PROVIDER_CONFIGURATION;
}
