import { BLOCKCHAIN_NAME } from '@rsdk-core/blockchain/models/blockchain-name';
import { UniswapV2AbstractProvider } from '@rsdk-features/instant-trades/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { SpiritSwapTrade } from '@rsdk-features/instant-trades/dexes/fantom/spirit-swap/spirit-swap-trade';
import { SPIRIT_SWAP_PROVIDER_CONFIGURATION } from '@rsdk-features/instant-trades/dexes/fantom/spirit-swap/constants';

export class SpiritSwapProvider extends UniswapV2AbstractProvider<SpiritSwapTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.FANTOM;

    public readonly InstantTradeClass = SpiritSwapTrade;

    public readonly providerSettings = SPIRIT_SWAP_PROVIDER_CONFIGURATION;
}
