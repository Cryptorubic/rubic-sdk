import { SPOOKY_SWAP_PROVIDER_CONFIGURATION } from 'src/features/instant-trades/providers/dexes/fantom/spooky-swap/constants';
import { UniswapV2AbstractProvider } from 'src/features/instant-trades/providers/dexes/abstract/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { SpookySwapTrade } from 'src/features/instant-trades/providers/dexes/fantom/spooky-swap/spooky-swap-trade';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

export class SpookySwapProvider extends UniswapV2AbstractProvider<SpookySwapTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.FANTOM;

    public readonly InstantTradeClass = SpookySwapTrade;

    public readonly providerSettings = SPOOKY_SWAP_PROVIDER_CONFIGURATION;
}
