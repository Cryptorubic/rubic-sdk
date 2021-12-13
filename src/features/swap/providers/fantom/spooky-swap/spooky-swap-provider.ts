import { BLOCKCHAIN_NAME } from '@core/blockchain/models/BLOCKCHAIN_NAME';
import { UniswapV2AbstractProvider } from '@features/swap/providers/common/uniswap-v2-abstract-provider/uniswap-v2-abstract-provider';
import { SPOOKY_SWAP_PROVIDER_CONFIGURATION } from '@features/swap/providers/fantom/spooky-swap/constants';
import { SpookySwapTrade } from '@features/swap/trades/fantom/spooky-swap/spooky-swap-trade';

export class SpookySwapProvider extends UniswapV2AbstractProvider<SpookySwapTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.FANTOM;

    public readonly InstantTradeClass = SpookySwapTrade;

    public readonly providerSettings = SPOOKY_SWAP_PROVIDER_CONFIGURATION;
}
