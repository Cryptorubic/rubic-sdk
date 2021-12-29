import { BLOCKCHAIN_NAME } from '@core/blockchain/models/BLOCKCHAIN_NAME';
import { ZrxAbstractProvider } from '@features/swap/dexes/common/zrx-common/zrx-abstract-provider';
import { TRADE_TYPE, TradeType } from 'src/features';

export class ZrxEthereumProvider extends ZrxAbstractProvider {
    get type(): TradeType {
        return TRADE_TYPE.ZRX_ETHEREUM;
    }

    public readonly blockchain = BLOCKCHAIN_NAME.ETHEREUM;
}
