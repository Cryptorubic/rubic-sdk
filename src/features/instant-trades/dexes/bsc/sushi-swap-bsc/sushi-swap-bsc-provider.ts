import { SushiSwapBscTrade } from 'src/features/instant-trades/dexes/bsc/sushi-swap-bsc/sushi-swap-bsc-trade';
import { UniswapV2AbstractProvider } from 'src/features/instant-trades/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { SUSHI_SWAP_BSC_PROVIDER_CONFIGURATION } from 'src/features/instant-trades/dexes/bsc/sushi-swap-bsc/constants';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

export class SushiSwapBscProvider extends UniswapV2AbstractProvider<SushiSwapBscTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN;

    public readonly InstantTradeClass = SushiSwapBscTrade;

    public readonly providerSettings = SUSHI_SWAP_BSC_PROVIDER_CONFIGURATION;
}
