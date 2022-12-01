import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { CurveAvalancheTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/avalanche/curve-avalanche/curve-avalanche-trade';
import { CurveAbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/curve-provider/curve-abstract-provider';

export class CurveAvalancheProvider extends CurveAbstractProvider<CurveAvalancheTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.AVALANCHE;

    public readonly Trade = CurveAvalancheTrade;
}
