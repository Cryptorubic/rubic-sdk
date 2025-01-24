import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { CurveAbstractProvider } from '../../common/curve-provider/curve-abstract-provider';
import { CurveFraxtalTrade } from './curve-fraxtal-trade';

export class CurveFraxtalProvider extends CurveAbstractProvider<CurveFraxtalTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.FRAXTAL;

    public readonly Trade = CurveFraxtalTrade;
}
