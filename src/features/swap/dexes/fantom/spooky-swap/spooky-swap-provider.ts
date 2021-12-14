import { BLOCKCHAIN_NAME } from '@core/blockchain/models/BLOCKCHAIN_NAME';
import { UniswapV2AbstractProvider } from '@features/swap/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { SPOOKY_SWAP_PROVIDER_CONFIGURATION } from '@features/swap/dexes/fantom/spooky-swap/constants';
import { SpookySwapTrade } from '@features/swap/dexes/fantom/spooky-swap/spooky-swap-trade';

export class SpookySwapProvider extends UniswapV2AbstractProvider<SpookySwapTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.FANTOM;

    public readonly InstantTradeClass = SpookySwapTrade;

    public readonly providerSettings = SPOOKY_SWAP_PROVIDER_CONFIGURATION;
}
