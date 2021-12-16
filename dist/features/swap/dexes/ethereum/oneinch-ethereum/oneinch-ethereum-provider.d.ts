import { OneinchAbstractProvider } from '@features/swap/dexes/common/oneinch-common/oneinch-abstract-provider';
import { BLOCKCHAIN_NAME } from '@core/blockchain/models/BLOCKCHAIN_NAME';
export declare class OneinchEthereumProvider extends OneinchAbstractProvider {
    readonly blockchain = BLOCKCHAIN_NAME.ETHEREUM;
}
