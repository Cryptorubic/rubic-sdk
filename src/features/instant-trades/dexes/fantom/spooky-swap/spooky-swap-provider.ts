import { BLOCKCHAIN_NAME } from '@rsdk-core/blockchain/models/blockchain-name';
import { UniswapV2AbstractProvider } from '@rsdk-features/instant-trades/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { SPOOKY_SWAP_PROVIDER_CONFIGURATION } from '@rsdk-features/instant-trades/dexes/fantom/spooky-swap/constants';
import { SpookySwapTrade } from '@rsdk-features/instant-trades/dexes/fantom/spooky-swap/spooky-swap-trade';

export class SpookySwapProvider extends UniswapV2AbstractProvider<SpookySwapTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.FANTOM;

    public readonly InstantTradeClass = SpookySwapTrade;

    public readonly providerSettings = SPOOKY_SWAP_PROVIDER_CONFIGURATION;
}
