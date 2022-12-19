import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { CurveAbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/curve-provider/curve-abstract-provider';
import { CurveEthereumTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/ethereum/curve-ethereum/curve-ethereum-trade';

export class CurveEthereumProvider extends CurveAbstractProvider<CurveEthereumTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.ETHEREUM;

    public readonly Trade = CurveEthereumTrade;
}
