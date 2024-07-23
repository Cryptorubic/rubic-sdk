import { ON_CHAIN_TRADE_TYPE } from '../../common/models/on-chain-trade-type';
import {
    TonkeeperDexType,
    TonkeeperStonfiQuoteInfo
} from '../common/tonkeeper/models/tonkeeper-api-types';
import { TonkeeperOnChainProvider } from '../common/tonkeeper/tonkeeper-on-chain-provider';

export class StonfiOnChainProvider extends TonkeeperOnChainProvider<TonkeeperStonfiQuoteInfo> {
    protected tonkeeperDexType: TonkeeperDexType = 'stonfi';

    public tradeType = ON_CHAIN_TRADE_TYPE.STONFI;
}
