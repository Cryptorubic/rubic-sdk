import { BLOCKCHAIN_NAME } from '@core/blockchain/models/BLOCKCHAIN_NAME';
import { UniswapV2AbstractProvider } from '@features/swap/providers/common/uniswap-v2-abstract-provider/uniswap-v2-abstract-provider';
import { SUSHI_SWAP_FANTOM_PROVIDER_CONFIGURATION } from '@features/swap/providers/fantom/sushi-swap-fantom/constants';
import { SushiSwapFantomTrade } from '@features/swap/trades/fantom/sushi-swap-fantom/sushi-swap-fantom-trade';

export class SushiSwapFantomProvider extends UniswapV2AbstractProvider<SushiSwapFantomTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.FANTOM;

    public readonly InstantTradeClass = SushiSwapFantomTrade;

    public readonly providerSettings = SUSHI_SWAP_FANTOM_PROVIDER_CONFIGURATION;
}
