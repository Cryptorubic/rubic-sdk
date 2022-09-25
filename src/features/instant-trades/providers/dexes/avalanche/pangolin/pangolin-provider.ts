import { PANGOLIN_PROVIDER_CONFIGURATION } from 'src/features/instant-trades/providers/dexes/avalanche/pangolin/constants';
import { UniswapV2AbstractProvider } from 'src/features/instant-trades/providers/dexes/abstract/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { PangolinTrade } from 'src/features/instant-trades/providers/dexes/avalanche/pangolin/pangolin-trade';

export class PangolinProvider extends UniswapV2AbstractProvider<PangolinTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.AVALANCHE;

    public readonly InstantTradeClass = PangolinTrade;

    public readonly providerSettings = PANGOLIN_PROVIDER_CONFIGURATION;
}
