import { OneinchAbstractProvider } from '@features/swap/dexes/common/oneinch-common/oneinch-abstract-provider';
import { BLOCKCHAIN_NAME } from '@core/blockchain/models/BLOCKCHAIN_NAME';

export class OneinchPolygonProvider extends OneinchAbstractProvider {
    public readonly blockchain = BLOCKCHAIN_NAME.POLYGON;
}
