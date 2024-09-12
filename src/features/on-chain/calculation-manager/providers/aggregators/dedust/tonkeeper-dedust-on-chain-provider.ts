import { ON_CHAIN_TRADE_TYPE } from '../../common/models/on-chain-trade-type';
import {
    TonkeeperDedustQuoteInfo,
    TonkeeperDexType
} from '../common/tonkeeper/models/tonkeeper-api-types';
import { TonkeeperOnChainProvider } from '../common/tonkeeper/tonkeeper-on-chain-provider';

export class DedustOnChainProvider extends TonkeeperOnChainProvider<TonkeeperDedustQuoteInfo> {
    protected tonkeeperDexType: TonkeeperDexType = 'dedust';

    public tradeType = ON_CHAIN_TRADE_TYPE.DEDUST;
}
