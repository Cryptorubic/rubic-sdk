import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { CurveAbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/curve-provider/curve-abstract-provider';
import { CurveMoonbeamTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/moonbeam/curve-moonbeam/curve-moonbeam-trade';

export class CurveMoonbeamProvider extends CurveAbstractProvider<CurveMoonbeamTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.MOONBEAM;

    public readonly Trade = CurveMoonbeamTrade;
}
