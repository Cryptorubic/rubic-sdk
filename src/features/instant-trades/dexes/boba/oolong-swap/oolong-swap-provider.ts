import { BLOCKCHAIN_NAME } from '@rsdk-core/blockchain/models/blockchain-name';
import { UniswapV2AbstractProvider } from '@rsdk-features/instant-trades/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { OolongSwapTrade } from 'src/features/instant-trades/dexes/boba/oolong-swap/oolong-swap-trade';
import { OOLONG_SWAP_PROVIDER_CONFIGURATION } from 'src/features/instant-trades/dexes/boba/oolong-swap/constants';

export class OolongSwapProvider extends UniswapV2AbstractProvider<OolongSwapTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.BOBA;

    public readonly InstantTradeClass = OolongSwapTrade;

    public readonly providerSettings = OOLONG_SWAP_PROVIDER_CONFIGURATION;
}
