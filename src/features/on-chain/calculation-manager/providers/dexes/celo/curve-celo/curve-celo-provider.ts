import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { CurveCeloTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/celo/curve-celo/curve-celo-trade';
import { CurveAbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/curve-provider/curve-abstract-provider';

export class CurveCeloProvider extends CurveAbstractProvider<CurveCeloTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.CELO;

    public readonly Trade = CurveCeloTrade;
}
