import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { CurveAbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/curve-provider/curve-abstract-provider';
import { CurveGnosisTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/gnosis/curve-gnosis/curve-gnosis-trade';

export class CurveGnosisProvider extends CurveAbstractProvider<CurveGnosisTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.GNOSIS;

    public readonly Trade = CurveGnosisTrade;
}
