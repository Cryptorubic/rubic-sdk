import { JOE_PROVIDER_CONFIGURATION } from 'src/features/instant-trades/dexes/avalanche/joe/constants';
import { UniswapV2AbstractProvider } from 'src/features/instant-trades/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { JoeTrade } from 'src/features/instant-trades/dexes/avalanche/joe/joe-trade';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

export class JoeProvider extends UniswapV2AbstractProvider<JoeTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.AVALANCHE;

    public readonly InstantTradeClass = JoeTrade;

    public readonly providerSettings = JOE_PROVIDER_CONFIGURATION;
}
