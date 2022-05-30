import { BLOCKCHAIN_NAME } from '@core/blockchain/models/blockchain-name';
import { UniswapV2AbstractProvider } from '@features/instant-trades/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { SUSHI_SWAP_FANTOM_PROVIDER_CONFIGURATION } from '@features/instant-trades/dexes/fantom/sushi-swap-fantom/constants';
import { SushiSwapFantomTrade } from '@features/instant-trades/dexes/fantom/sushi-swap-fantom/sushi-swap-fantom-trade';

export class SushiSwapFantomProvider extends UniswapV2AbstractProvider<SushiSwapFantomTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.FANTOM;

    public readonly InstantTradeClass = SushiSwapFantomTrade;

    public readonly providerSettings = SUSHI_SWAP_FANTOM_PROVIDER_CONFIGURATION;
}
