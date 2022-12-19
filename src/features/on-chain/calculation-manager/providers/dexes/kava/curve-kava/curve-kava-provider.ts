import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { CurveAbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/curve-provider/curve-abstract-provider';
import { CurveKavaTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/kava/curve-kava/curve-kava-trade';

export class CurveKavaProvider extends CurveAbstractProvider<CurveKavaTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.KAVA;

    public readonly Trade = CurveKavaTrade;
}
