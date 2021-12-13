import { OneinchProvider } from '@features/swap/providers/common/oneinch-abstract-provider/oneinch-provider';
import { BLOCKCHAIN_NAME } from '@core/blockchain/models/BLOCKCHAIN_NAME';

export class OneinchEthereumProvider extends OneinchProvider {
    public readonly blockchain = BLOCKCHAIN_NAME.ETHEREUM;
}
