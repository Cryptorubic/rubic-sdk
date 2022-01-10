import { OneinchAbstractProvider } from '../../common/oneinch-common/oneinch-abstract-provider';
import { TradeType } from '../../../..';
export declare class OneinchEthereumProvider extends OneinchAbstractProvider {
    get type(): TradeType;
    readonly blockchain = MAINNET_BLOCKCHAIN_NAME.ETHEREUM;
}
