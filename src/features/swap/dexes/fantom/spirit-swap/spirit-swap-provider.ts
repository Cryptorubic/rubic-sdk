import { BLOCKCHAIN_NAME } from '@core/blockchain/models/BLOCKCHAIN_NAME';
import { UniswapV2AbstractProvider } from '@features/swap/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { SPOOKY_SWAP_PROVIDER_CONFIGURATION } from '@features/swap/dexes/fantom/spooky-swap/constants';
import { SpiritSwapTrade } from '@features/swap/dexes/fantom/spirit-swap/spirit-swap-trade';

export class SpiritSwapProvider extends UniswapV2AbstractProvider<SpiritSwapTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.FANTOM;

    public readonly InstantTradeClass = SpiritSwapTrade;

    public readonly providerSettings = SPOOKY_SWAP_PROVIDER_CONFIGURATION;
}
