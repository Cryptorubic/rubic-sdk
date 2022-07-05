import { BLOCKCHAIN_NAME } from '@rsdk-core/blockchain/models/blockchain-name';
import { JOE_PROVIDER_CONFIGURATION } from '@rsdk-features/instant-trades/dexes/avalanche/joe/constants';
import { UniswapV2AbstractProvider } from '@rsdk-features/instant-trades/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { JoeTrade } from '@rsdk-features/instant-trades/dexes/avalanche/joe/joe-trade';

export class JoeProvider extends UniswapV2AbstractProvider<JoeTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.AVALANCHE;

    public readonly InstantTradeClass = JoeTrade;

    public readonly providerSettings = JOE_PROVIDER_CONFIGURATION;
}
