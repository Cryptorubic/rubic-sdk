import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { ZrxAbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/zrx-abstract/zrx-abstract-provider';

export class ZrxEthereumProvider extends ZrxAbstractProvider {
    public readonly blockchain = BLOCKCHAIN_NAME.ETHEREUM;
}
