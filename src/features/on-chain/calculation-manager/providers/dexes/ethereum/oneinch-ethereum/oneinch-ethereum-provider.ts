import { OneinchAbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/oneinch-abstract/oneinch-abstract-provider';
import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';

export class OneinchEthereumProvider extends OneinchAbstractProvider {
    public readonly blockchain = BLOCKCHAIN_NAME.ETHEREUM;
}
