import { BLOCKCHAIN_NAME } from '@core/blockchain/models/BLOCKCHAIN_NAME';
import { UniswapV2AbstractProvider } from '@features/swap/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { QUICK_SWAP_PROVIDER_CONFIGURATION } from '@features/swap/dexes/polygon/quick-swap/constants';
import { QuickSwapTrade } from '@features/swap/dexes/polygon/quick-swap/quick-swap-trade';

export class QuickSwapProvider extends UniswapV2AbstractProvider<QuickSwapTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.POLYGON;

    public readonly InstantTradeClass = QuickSwapTrade;

    public readonly providerSettings = QUICK_SWAP_PROVIDER_CONFIGURATION;
}
