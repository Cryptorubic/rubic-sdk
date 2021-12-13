import { BLOCKCHAIN_NAME } from '@core/blockchain/models/BLOCKCHAIN_NAME';
import { SUSHI_SWAP_BSC_PROVIDER_CONFIGURATION } from '@features/swap/providers/bsc/sushi-swap-bsc/constants';
import { UniswapV2AbstractProvider } from '@features/swap/providers/common/uniswap-v2-abstract-provider/uniswap-v2-abstract-provider';
import { SushiSwapBscTrade } from '@features/swap/trades/bsc/sushi-swap-bsc/sushi-swap-bsc-trade';

export class SushiSwapBscProvider extends UniswapV2AbstractProvider<SushiSwapBscTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN;

    public readonly InstantTradeClass = SushiSwapBscTrade;

    public readonly providerSettings = SUSHI_SWAP_BSC_PROVIDER_CONFIGURATION;
}
