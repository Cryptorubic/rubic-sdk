import { OneinchAbstractProvider } from '@features/instant-trades/dexes/common/oneinch-common/oneinch-abstract-provider';
import { BLOCKCHAIN_NAME } from '@core/blockchain/models/blockchain-name';
import { TRADE_TYPE, TradeType } from 'src/features';

export class OneinchAvalancheProvider extends OneinchAbstractProvider {
    get type(): TradeType {
        return TRADE_TYPE.ONE_INCH_AVALANCHE;
    }

    public readonly blockchain = BLOCKCHAIN_NAME.AVALANCHE;
}
