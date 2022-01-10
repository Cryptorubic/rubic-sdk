import { ZrxAbstractProvider } from '../../common/zrx-common/zrx-abstract-provider';
import { TradeType } from '../../../..';
export declare class ZrxEthereumProvider extends ZrxAbstractProvider {
    get type(): TradeType;
    readonly blockchain = MAINNET_BLOCKCHAIN_NAME.ETHEREUM;
}
