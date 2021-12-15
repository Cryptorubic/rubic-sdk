import { BLOCKCHAIN_NAME } from '@core/blockchain/models/BLOCKCHAIN_NAME';
import { ZrxAbstractProvider } from '@features/swap/dexes/common/zrx-common/zrx-abstract-provider';

export class ZrxEthereumProvider extends ZrxAbstractProvider {
    public readonly blockchain = BLOCKCHAIN_NAME.ETHEREUM;
}
