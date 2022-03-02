import { BLOCKCHAIN_NAME } from '@core/blockchain/models/BLOCKCHAIN_NAME';
import { PANGOLIN_PROVIDER_CONFIGURATION } from '@features/instant-trades/dexes/avalanche/pangolin/constants';
import { UniswapV2AbstractProvider } from '@features/instant-trades/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { PangolinTrade } from '@features/instant-trades/dexes/avalanche/pangolin/pangolin-trade';

export class PangolinProvider extends UniswapV2AbstractProvider<PangolinTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.AVALANCHE;

    public readonly InstantTradeClass = PangolinTrade;

    public readonly providerSettings = PANGOLIN_PROVIDER_CONFIGURATION;
}
