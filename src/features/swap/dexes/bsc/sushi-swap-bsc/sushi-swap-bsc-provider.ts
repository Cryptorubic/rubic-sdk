import { BLOCKCHAIN_NAME } from '@core/blockchain/models/BLOCKCHAIN_NAME';
import { SUSHI_SWAP_BSC_PROVIDER_CONFIGURATION } from '@features/swap/dexes/bsc/sushi-swap-bsc/constants';
import { UniswapV2AbstractProvider } from '@features/swap/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { SushiSwapBscTrade } from '@features/swap/dexes/bsc/sushi-swap-bsc/sushi-swap-bsc-trade';

export class SushiSwapBscProvider extends UniswapV2AbstractProvider<SushiSwapBscTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN;

    public readonly InstantTradeClass = SushiSwapBscTrade;

    public readonly providerSettings = SUSHI_SWAP_BSC_PROVIDER_CONFIGURATION;
}
