import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { CurveAbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/curve-provider/curve-abstract-provider';
import { CurvePulsechainTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/pulsechain/curve-pulsechain/curve-ethereum-trade';

export class CurvePulsechainProvider extends CurveAbstractProvider<CurvePulsechainTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.PULSECHAIN;

    public readonly Trade = CurvePulsechainTrade;
}
