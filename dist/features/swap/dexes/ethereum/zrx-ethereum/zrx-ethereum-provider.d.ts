import { BLOCKCHAIN_NAME } from '../../../../../core/blockchain/models/BLOCKCHAIN_NAME';
import { ZrxAbstractProvider } from '../../common/zrx-common/zrx-abstract-provider';
export declare class ZrxEthereumProvider extends ZrxAbstractProvider {
    readonly blockchain = BLOCKCHAIN_NAME.ETHEREUM;
}
