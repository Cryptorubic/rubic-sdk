import { BLOCKCHAIN_NAME } from '@core/blockchain/models/BLOCKCHAIN_NAME';
import { JOE_PROVIDER_CONFIGURATION } from '@features/swap/dexes/avalanche/joe/constants';
import { UniswapV2AbstractProvider } from '@features/swap/dexes/common/uniswap-v2-abstract/uniswap-v2-abstract-provider';
import { JoeTrade } from '@features/swap/dexes/avalanche/joe/joe-trade';

export class JoeProvider extends UniswapV2AbstractProvider<JoeTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.AVALANCHE;

    public readonly InstantTradeClass = JoeTrade;

    public readonly providerSettings = JOE_PROVIDER_CONFIGURATION;
}
