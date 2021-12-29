import { OneinchAbstractProvider } from '@features/swap/dexes/common/oneinch-common/oneinch-abstract-provider';
import { BLOCKCHAIN_NAME } from '@core/blockchain/models/BLOCKCHAIN_NAME';
import { TRADE_TYPE, TradeType } from 'src/features';

export class OneinchEthereumProvider extends OneinchAbstractProvider {
    get type(): TradeType {
        return TRADE_TYPE.ONE_INCH_ETHEREUM;
    }

    public readonly blockchain = BLOCKCHAIN_NAME.ETHEREUM;
}
