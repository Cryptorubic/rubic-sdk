import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { CurveAbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/curve-provider/curve-abstract-provider';
import { CurveFantomTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/fantom/curve-fantom/curve-fantom-trade';

export class CurveFantomProvider extends CurveAbstractProvider<CurveFantomTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.FANTOM;

    public readonly Trade = CurveFantomTrade;
}
