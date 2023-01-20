import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { CurveAbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/curve-provider/curve-abstract-provider';
import { CurveOptimismTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/optimism/curve-optimism/curve-optimism-trade';

export class CurveOptimismProvider extends CurveAbstractProvider<CurveOptimismTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.OPTIMISM;

    public readonly Trade = CurveOptimismTrade;
}
