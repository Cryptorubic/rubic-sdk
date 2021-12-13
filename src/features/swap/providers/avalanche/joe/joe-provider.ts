import { BLOCKCHAIN_NAME } from '@core/blockchain/models/BLOCKCHAIN_NAME';
import { JOE_PROVIDER_CONFIGURATION } from '@features/swap/providers/avalanche/joe/constants';
import { UniswapV2AbstractProvider } from '@features/swap/providers/common/uniswap-v2-abstract-provider/uniswap-v2-abstract-provider';
import { JoeTrade } from '@features/swap/trades/avalanche/joe-trade/joe-trade';

export class JoeProvider extends UniswapV2AbstractProvider<JoeTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.AVALANCHE;

    public readonly InstantTradeClass = JoeTrade;

    public readonly providerSettings = JOE_PROVIDER_CONFIGURATION;
}
