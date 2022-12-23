import { BLOCKCHAIN_NAME } from 'src/core/blockchain/models/blockchain-name';
import { CurveAbstractProvider } from 'src/features/on-chain/calculation-manager/providers/dexes/common/curve-provider/curve-abstract-provider';
import { CurvePolygonTrade } from 'src/features/on-chain/calculation-manager/providers/dexes/polygon/curve-polygon/curve-polygon-trade';

export class CurvePolygonProvider extends CurveAbstractProvider<CurvePolygonTrade> {
    public readonly blockchain = BLOCKCHAIN_NAME.POLYGON;

    public readonly Trade = CurvePolygonTrade;
}
