import { OneinchAbstractProvider } from '../../common/oneinch-common/oneinch-abstract-provider';
import { TradeType } from '../../../..';
export declare class OneinchBscProvider extends OneinchAbstractProvider {
    get type(): TradeType;
    readonly blockchain = MAINNET_BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN;
}
